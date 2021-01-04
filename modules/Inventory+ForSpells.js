/*
22-Dec-2020     0.5.1: Incorporate Inventory+ (Felix Müller aka syl3r86) and implement its category and drag-and-drop tools  
                Have to copy code because overrides are too difficult
23-Dec-2020     0.5.1: - Have to null out flags.spell-better during development     
24-Dec-2020     0.5.1i: filterSpells(): loops over legal filterSets in the passed spell filters    
                0.5.1k: Check the flags as well for inclusion     
27-Dec-2020     0.5.1s: categorizeSpells: Copy over slots etc from real sections  
29-Dec-2020     0.5.1t: Only save the customCategories and merge with the standardCategories (then we don't have to upgrade standard categories)              
                Delete standardCategories from the saved ones
30-Dec-2020     0.5.1x: Store standard categories, but just for the isCollapsed status   
                If (default) hide standard categories with no spells, remove them for display    
1-Jan-2021     0.5.1aa: If the showOnlyInCategory flag is set, create a flagFilterSet and templateFlag to represent that   
2-Jan-2021     0.5.1ac: Refactor newCategory and add editCategory
                sortCategories(): Add isFirst, isLast (for not displaying move controls)
3-Jan-2021      0.5.2a: Switch categorizeSpells() and filterSPells() to property-oriented labelFilterSets  
                0.5.2c: Use foundry.js#randomID() to replace built-in getCategoryId which was producing single character id's
*/

import {SpellBetterCharacterSheet} from "./SpellBetter.js";
import {Category} from "./Category.js";
import { MODULE_ID, SPELL_BETTER } from './constants.js';

export class InventoryPlusForSpells {
    constructor(actor) {
        this.actor = actor;
        this.initCategories();
    }

    initCategories() {
        //Saved custom categories
        const savedCategories = this.actor.getFlag(MODULE_ID, SPELL_BETTER.categories_key);
        const savedCategoriesVersion = this.actor.getFlag(MODULE_ID, SPELL_BETTER.categoriesVersion_key);
        //Upgrade the saved categories if necessary (compare savedCategoriesVersion)
        if (SPELL_BETTER.categoriesVersion !== (savedCategoriesVersion ?? MODULE_VERSION)) {

        }
        let customCategories = {};
        if (savedCategories) {
            //Get the custom categories
            for (const [category, value] of Object.entries(savedCategories)) {
                if (value.isCustom) {customCategories[category] = value}
            }
        }
        //Merge standard and custom categories
        this.allCategories = mergeObject(customCategories, SPELL_BETTER.standardCategories);
        //And now apply info about collapsed/shown (the only reason we saved)
        for (const category of Object.keys(this.allCategories)) {
            if (savedCategories && savedCategories[category]) {
                this.allCategories[category].isCollapsed = savedCategories[category].isCollapsed;
            }
        }

        this.sortCategories();
    }

    
    sortCategories() {
        let sortedCategories = {};

        let keys = Object.keys(this.allCategories);
        keys.sort((a, b) => {
            return this.allCategories[a].order - this.allCategories[b].order;
        });
        for (let key of keys) {
            sortedCategories[key] = this.allCategories[key];
            sortedCategories[key].isFirst = false;
            sortedCategories[key].isLast = false;
        }
        sortedCategories[keys[0]].isFirst = true;
        sortedCategories[keys[keys.length-1]].isLast = true;
        this.allCategories = sortedCategories;
    }

    static filterSpells(spells, labelFilterSets, flagFilterSets={}) {
        return spells.filter(spell => {
            let includeSpell = true;
            //0.5.1i: Instead of working off SPELL_BETTER.filters, just use the available filterSets
            //LabelFilters are against standard things (levels, schools...) that are in the labels
            for (const [filterSetKey, filters] of Object.entries(labelFilterSets)) {
                if (!Object.keys(SPELL_BETTER.labelFilterSets).includes(filterSetKey)) continue;
                const isInSpellLabels = filters?.filter(f =>  Object.values(spell.labels).includes(f));
                includeSpell = includeSpell && (isInSpellLabels?.length > 0);
                if (!includeSpell) break;
            }//end for labelFilters

            //Apply the flagFilters only if the spell is already included
            if (includeSpell) {
                //If we have flagFilterSets, but no flags, might be an exclude (indicated by empty filter list)
                //so we have to process
                for (const [filterSetKey, filters] of Object.entries(flagFilterSets)) {
                    //0.5.1: Just a single flag per flag label for now
                    const flagForFilterSet =  (spell.flags && spell.flags[MODULE_ID]) ? spell.flags[MODULE_ID][filterSetKey] : null;
                    //Possibilities:
                    //flagForFilterSet is null AND afs.filters is [] => INCLUDE
                    //flagForFilterSet exists and is included in afs.filters => INCLUDE
                    //flagForFilterSet exists and afs.filters doesn't include the flag => EXCLUDE
                    const includedInFilterSet = (!flagForFilterSet && !filters?.length) 
                                                || (flagForFilterSet && filters?.includes(flagForFilterSet))
                    includeSpell = includeSpell && includedInFilterSet;
                    if (!includeSpell) break;
                }//end for flagFilters
            }//end if includeSpell
            return includeSpell;
        });
    }

    categorizeSpells(spellbook) {
        let categories = duplicate(this.allCategories);

        //Categorize spells for display; the same spell could appear in MULTIPLE areas
        //TODO: Would probably be more efficient to make the outer loop the spells and the inner loop the categories, since most spells will be in one category        
        for (const [category, value] of Object.entries(categories) ) {
            categories[category].spells = [];
            //0.5.1aa: If the showOnlyInCategory flag is set, create a flagFilterSet to represent that
            const labelFilterSets = value.labelFilterSets ? duplicate(value.labelFilterSets) : {};
            let flagFilterSets = value.flagFilterSets ? duplicate(value.flagFilterSets) : {};
            if (!value.showAnyCategory) {
                flagFilterSets["category"] = [];
            }
            if (value.showOnlyInCategory) {
                flagFilterSets["category"] = [category];
            }

            for (const section of spellbook) {
                const filteredSpells = InventoryPlusForSpells.filterSpells(section.spells, labelFilterSets, flagFilterSets);
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
            //0.5.1x: If (default) hide standard categories with no spells, remove them for display
            if (game.settings.get(MODULE_ID, SPELL_BETTER.hideCategoryWithNoSpells)) {
                if (!value.isCustom && !value.spells?.length) {
                    delete categories[category];
                    continue;
                }
            }
            //Now sort spells within categories - should make this configurable
            categories[category].spells.sort((a, b) => {
                return a.sort - b.sort;
            });
        }

        return categories;
    }

    getTemplateItemData(categoryKey) {
        const customCategory = this.allCategories[categoryKey];
        let templateItemData = {name: game.i18n.localize(customCategory?.label), type: "spell" }
        let templateItemDataData = customCategory.templateItemData ? duplicate(customCategory.templateItemData) : null;
        if (templateItemDataData) {
            mergeObject(templateItemData, {data: templateItemDataData});
        }
        let templateFlags = customCategory?.templateFlags ?? {}
        //0.5.1aa If the showOnlyInCategory flag is set, then create a pseudo templateFlag
        if (customCategory.showOnlyInCategory) {
            mergeObject(templateFlags, {"category": categoryKey});
        }
        return {templateItemData, templateFlags};
    }

    async newCategory() {
        new Category(null, {}, this).render(true);
    }

    async editCategory(categoryKey) {
        new Category(categoryKey, {}, this).render(true);
    }

    async removeCategory(categoryKey) {
        let changedItems = [];
        //Remove the categoryKey off the contained spells
        for (let spell of this.actor.data.items.filter(i => i.type === "spell")) {
            let type = InventoryPlusForSpells.getSpellCategory(spell);
            if (type === categoryKey) {
                const unsetFlag =  `-=flags.${MODULE_ID}`;
                const changedItem = {_id: spell.id}
                changedItem[unsetFlag] = null;
                changedItems.push(changedItem);
            }
        }
        await this.actor.updateEmbeddedEntity('OwnedItem', changedItems);

        delete this.allCategories[categoryKey];
        let deleteKey = `-=${categoryKey}`
        this.actor.setFlag(MODULE_ID,  SPELL_BETTER.categories_key, { [deleteKey]:null });
    }


    static getSpellCategory(spell) {
        const spellFlags = spell.flags[MODULE_ID];
        const spellCategory = spellFlags ? spellFlags.category : null;
        return spellCategory;
    }

    changeCategoryOrder(movedCategory, up) {
        let targetCategory = movedCategory;
        let currentSortFlag = 0;
        if(!up) currentSortFlag = 999999999;
        for (let id in this.allCategories) {
            let currentCategory = this.allCategories[id];
            if (up) {
                if (id !== movedCategory && currentCategory.order < this.allCategories[movedCategory].order && currentCategory.order > currentSortFlag) {
                    targetCategory = id;
                    currentSortFlag = currentCategory.order;
                }
            } else {
                if (id !== movedCategory && currentCategory.order > this.allCategories[movedCategory].order && currentCategory.order < currentSortFlag) {
                    targetCategory = id;
                    currentSortFlag = currentCategory.order;
                }
            }
        } 

        if (movedCategory !== targetCategory) {
            let oldMovedSortFlag = this.allCategories[movedCategory].order;
            let newMovedSortFlag = currentSortFlag;

            this.allCategories[movedCategory].order = newMovedSortFlag;
            this.allCategories[targetCategory].order = oldMovedSortFlag;
            this.sortCategories();
            this.saveCategories();
        }
    }


    getHighestSortFlag() {
        let highest = 0;

        for (let id in this.allCategories) {
            let cat = this.allCategories[id];
            if (cat.order > highest) {
                highest = cat.order;
            }
        }

        return highest;
    }

    getLowestSortFlag() {
        let lowest = 999999999;

        for (let id in this.allCategories) {
            let cat = this.allCategories[id];
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
            id = randomID(7);
            iterations--;
        } while (this.allCategories[id] !== undefined && iterations > 0)

        return id;
    }


    async saveCategories(category=null) {
        //Save all categories, because we want the collapsed/shown status
        await this.actor.setFlag(MODULE_ID, SPELL_BETTER.categories_key, null);
        await this.actor.setFlag(MODULE_ID,  SPELL_BETTER.categories_key, this.allCategories);
        //0.5.1s: Save the categoryVersion (which means we need to do any upgrading on read)
        await this.actor.setFlag(MODULE_ID, SPELL_BETTER.categoriesVersion_key, SPELL_BETTER.categoriesVersion);
    }
}//end InventoryPlusForSpells
