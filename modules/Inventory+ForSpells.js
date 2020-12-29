/*
22-Dec-2020     0.5.1: Incorporate Inventory+ (Felix Müller aka syl3r86) and implement its category and drag-and-drop tools  
                Have to copy code because overrides are too difficult
23-Dec-2020     0.5.1: - Have to null out flags.spell-better during development     
24-Dec-2020     0.5.1i: filterSpells(): loops over legal filterSets in the passed spell filters    
                0.5.1k: Check the flags as well for inclusion     
27-Dec-2020     0.5.1s: categorizeSpells: Copy over slots etc from real sections                
*/

import {SpellBetterCharacterSheet} from "./SpellBetter.js";
import { MODULE_ID, SPELL_BETTER } from './constants.js';

export class InventoryPlusForSpells {
    constructor(actor) {
        this.actor = actor;
        this.initCategories();
        //this.replaceOnDropItem();
    }

    initCategories() {
        //Standard categories that cannot be deleted
        let actorCategories = this.actor.getFlag(MODULE_ID, SPELL_BETTER.categories_key);
        
        if (!actorCategories) {
            this.customCategories = SPELL_BETTER.standardCategories;
            this.categoriesVersion = SPELL_BETTER.categoriesVersion;
        } else {
            this.customCategories = duplicate(actorCategories);
            this.categoriesVersion = this.actor.getFlag(MODULE_ID, SPELL_BETTER.categoriesVersion_key);
//FIXME: Sometimes we have to recreate the categories - how do we do this when we have a new version
//Should probably save the version with spell-better flags
            //this.customCategories = SPELL_BETTER.standardCategories;
            this.applySortKey();
        }
    }

    
    applySortKey() {
        let sortedCategories = {};

        let keys = Object.keys(this.customCategories);
        keys.sort((a, b) => {
            return this.customCategories[a].order - this.customCategories[b].order;
        });
        for (let key of keys) {
            sortedCategories[key] = this.customCategories[key];
        }
        this.customCategories = sortedCategories;
    }

    static filterSpells(spells, appliedFilterSets) {
        const labelFilterSets = Object.keys(SPELL_BETTER.labelFilterSets);
        return spells.filter(spell => {
            const {labels, flags} = spell;  //include spell for debugging
            let includeSpell = true;
            //0.5.1i: Instead of working off SPELL_BETTER.filters, just use the available filterSets
            //LabelFilters are gainst standard things (levels, schools...) that are in the labels

            const appliedLabelFilterSets = appliedFilterSets.filter(afs => labelFilterSets.includes(afs.filterSet));
            for (const afs of appliedLabelFilterSets) {
                const matches = afs.filters?.filter(f =>  Object.values(labels).includes(f));
                includeSpell = includeSpell && (matches.length > 0);
                if (!includeSpell) break;
            }//end for labelFilters

            //Apply the flagFilters only if the spell is already included
            if (includeSpell) {
                const appliedFlagFilterSets =  appliedFilterSets.filter(afs => !labelFilterSets.includes(afs.filterSet));
                //If we have flagFilterSets, but no flags, might be an exclude (indicated by empty filter list)
                //so we have to process
                for (const afs of appliedFlagFilterSets) {
                    //0.5.1: Just a single flag per flag label for now
                    const flagForFilterSet =  (flags && flags[MODULE_ID]) ? flags[MODULE_ID][afs.filterSet] : null;
                    //Possibilities:
                    //flagForFilterSet is null AND afs.filters is [] => INCLUDE
                    //flagForFilterSet exists and is included in afs.filters => INCLUDE
                    //flagForFilterSet exists and afs.filters doesn't include the flag => EXCLUDE
                    const includedInFilterSet = (!flagForFilterSet && !afs.filters?.length) 
                                                || (flagForFilterSet && afs.filters?.includes(flagForFilterSet))
                    includeSpell = includeSpell && includedInFilterSet;
                    if (!includeSpell) break;
                }//end for flagFilters
            }//end if includeSpell
            return includeSpell;
        });
    }

    categorizeSpells(spellbook) {
        let categories = duplicate(this.customCategories);

        //Categorize spells for display; the same spell could appear in MULTIPLE areas
        //TODO: Would probably be more efficient to make the outer loop the spells and the inner loop the categories, since most spells will be in one category        
        for (const [category, value] of Object.entries(categories) ) {
            categories[category].spells = [];
            for (const section of spellbook) {
                const filteredSpells = InventoryPlusForSpells.filterSpells(section.spells, value.filterSets);
                categories[category].spells.push(...filteredSpells);

                //Copy the standard level-based stats over
                if (section.prop && (section.prop === value.prop)) {
                    const levelStats = {
                        canCreate : section.canCreate,
                        canPrepare : section.canPrepare,
                        slots: section.slots,
                        uses: section.uses,
                        usesSlots: section.usesSlots
                    }
                    mergeObject(categories[category], levelStats);
                }
            }
            //Now sort spells within categories - should make this configurable
            categories[category].spells.sort((a, b) => {
                return a.sort - b.sort;
            });

        }
        return categories;
    }

    getTemplateItemData(category) {
        const customCategory = this.customCategories[category];
        let templateItemData = {name: game.i18n.localize(customCategory?.label), type: "spell" }
        let templateItemDataData = duplicate(customCategory?.templateItemData);
        if (templateItemDataData) {
            mergeObject(templateItemData, {data: templateItemDataData});
        }
        const templateFlags = customCategory?.templateFlags;
        return {templateItemData, templateFlags};
    }

    async createNewCategoryDialog() {
        const templateData = {
            filterSet : "Level",
            filters: SPELL_BETTER.labelFilterSets.levels.map(f => f.name)
        }
        let template = await renderTemplate('modules/spell-better/templates/categoryDialog.hbs', templateData);
        let d = new Dialog({
            title: game.i18n.localize("SPELL_BETTER.NewCategory.TITLE"),
            content: template,
            buttons: {
                accept: {
                    icon: '<i class="fas fa-check"></i>',
                    label: game.i18n.localize("SETTINGS.Save"),
                    callback: async html => {
                        let input = html.find('input');
                        this.createCategory(input);
                    }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize("Cancel")
                }
            },
            default: "accept",
        });
        d.render(true);
    }



    createCategory(inputs) {
        let newCategory = {}

        for (let input of inputs) {
            let value = input.type === 'checkbox' ? input.checked : input.value;
            if (input.dataset.dtype === "Number") {
                value = Number(value) > 0 ? Number(value) : 0;
            }
            newCategory[input.name] = value;
        }


        if (newCategory.label === undefined || newCategory.label === '') {
            ui.notifications.error('Could not create Category as no name was specified');
            return;
        }

        let key = this.generateCategoryId();

        newCategory.dataset = { type: key };
        newCategory.collapsed = false;
        newCategory.order = this.getHighestSortFlag() + 1000;
        this.customCategories[key] = newCategory;
        this.saveCategories();
    }

    async removeCategory(ev) {
        let catType = ev.target.dataset.type;
        let changedItems = [];
        for (let item of this.actor.spells) {
            let type = this.getSpellCategory(item.data);
            if (type === catType) {
                //await item.unsetFlag("spell-better", 'category');
                changedItems.push({
                    _id: item.id,
                    '-=flags.inventory-plus':null
                })
            }
        }
        await this.actor.updateEmbeddedEntity('OwnedItem', changedItems);

        delete this.customCategories[catType];
        let deleteKey = `-=${catType}`
        this.actor.setFlag(MODULE_ID,  SPELL_BETTER.categories_key, { [deleteKey]:null });
    }

    changeCategoryOrder(movedType, up) {
        let targetType = movedType;
        let currentSortFlag = 0;
        if(!up) currentSortFlag = 999999999;
        for (let id in this.customCategories) {
            let currentCategory = this.customCategories[id];
            if (up) {
                if (id !== movedType && currentCategory.order < this.customCategories[movedType].order && currentCategory.order > currentSortFlag) {
                    targetType = id;
                    currentSortFlag = currentCategory.order;
                }
            } else {
                if (id !== movedType && currentCategory.order > this.customCategories[movedType].order && currentCategory.order < currentSortFlag) {
                    targetType = id;
                    currentSortFlag = currentCategory.order;
                }
            }
        } 

        if (movedType !== targetType) {
            let oldMovedSortFlag = this.customCategories[movedType].order;
            let newMovedSortFlag = currentSortFlag;

            this.customCategories[movedType].order = newMovedSortFlag;
            this.customCategories[targetType].order = oldMovedSortFlag;
            this.applySortKey();
            this.saveCategories();
        }
    }


    getHighestSortFlag() {
        let highest = 0;

        for (let id in this.customCategories) {
            let cat = this.customCategories[id];
            if (cat.order > highest) {
                highest = cat.order;
            }
        }

        return highest;
    }

    getLowestSortFlag() {
        let lowest = 999999999;

        for (let id in this.customCategories) {
            let cat = this.customCategories[id];
            if (cat.order < lowest) {
                lowest = cat.order;
            }
        }

        return lowest;
    }

    generateCategoryId() {
        let id = '';
        let iterations = 100;
        do {
            id = Math.random().toString(36).substring(7);
            iterations--;
        } while (this.customCategories[id] !== undefined && iterations > 0 && id.length>=5)

        return id;
    }

    getSpellCategory(spell) {
        let category = getProperty(spell, 'flags.spell-better.category');
        if (category === undefined || this.customCategories[category] === undefined) {
            category = spell.type + spell.data.level;
        }
        return category;
    }

    async saveCategories() {
        //this.actor.update({ 'flags.inventory-plus.categories': this.customCategories }).then(() => { console.log(this.actor.data.flags) });
//FiXME: Need to null it during development, because if you change the format it remembers the old extraneous info        
        await this.actor.setFlag(MODULE_ID, SPELL_BETTER.categories_key, null);
        await this.actor.setFlag(MODULE_ID,  SPELL_BETTER.categories_key, this.customCategories);
        //0.5.1s: Save the categoryVersion (which means we need to do any upgrading on read)
        await this.actor.setFlag(MODULE_ID, SPELL_BETTER.categoriesVersion_key, this.categoriesVersion);
    }
}//end InventoryPlusForSpells
