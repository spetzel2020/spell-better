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
5-Jan-2021      0.5.3: filterSpells: Refactored to use new arguments, and no longer apply flagFilterSets
                0.5.3i: Check .filter().length > 0 (otherwise you get a truthy result of 1 which isn't working downstream)
                0.5.3j: initCategories(): Remove sortCategories() - sort when you add/remove or change order
7-Jan-2021      0.7.2: Was not importing MODULE_VERSION for initCategories()   
9-Jan-2021      0.7.3a: Fixed: Sort categories when you first load them     
10-Jan-2021     0.7.3d: sortCategories(): Renumber the categories so we don't have categories on the same sort position     
                Also call saveCateories()
*/

import {Category} from "./Category.js";
import { MODULE_ID, MODULE_VERSION, SPELL_BETTER } from './constants.js';

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
        //0.7.3d: Renumber the order while sorting
        for (const [index,key] of keys.entries()) {
            sortedCategories[key] = this.allCategories[key];
            sortedCategories[key].isFirst = false;
            sortedCategories[key].isLast = false;
            sortedCategories[key].order = 10 * index;
        }
        sortedCategories[keys[0]].isFirst = true;
        sortedCategories[keys[keys.length-1]].isLast = true;
        this.allCategories = sortedCategories;

        this.saveCategories();
    }

    filterSpells(spells, categoryKey, userLabelFilterSets=[]) {
        //Called with either categoryKey=none, in which case we use the manual set of filters and set categoryType="all"
        const category = categoryKey ? this.allCategories?.[categoryKey] : null;
        const labelFilterSets = !categoryKey ? userLabelFilterSets : category?.labelFilterSets;
        const categoryType = category?.categoryType ?? "all";
        const viewCategories = this.allCategories ? Object.keys(this.allCategories)?.filter(key => this.allCategories[key].categoryType === "view") : [];
        return spells.filter(spell => {
            let includeSpell = true;
            //0.5.1i: Instead of working off SPELL_BETTER.filters, just use the available filterSets
            //LabelFilters are against standard things (levels, schools...) that are in the labels
            if (labelFilterSets) {
                for (const [filterSetKey, filters] of Object.entries(labelFilterSets)) {
                    if (!Object.keys(SPELL_BETTER.labelFilterSets).includes(filterSetKey)) continue;
                    const isInSpellLabels = filters?.filter(f =>  Object.values(spell.labels).includes(f));
                    includeSpell = includeSpell && (isInSpellLabels?.length > 0);
                    if (!includeSpell) break;
                }//end for labelFilters
            }

            //Apply the flagFilters only if the spell is already included - if it's categoryType=all we ignore flags
            if (includeSpell && (categoryType !== "all")) {
                //0.5.3f: A spell could have more than one category flag, so we need to check back against the category definition
                //If a spell has {category: ["view1", "view2"]}, then it will be shown in View1 and View2, any Filter category, and All
                //If we have flagFilterSets, but no flags, might be an exclude (indicated by empty filter list)
                //so we have to process
                //0.5.3f: Replace flagFilterSets with categoryType of "filter","view","spellbook","all" (filter and all are not available for custom categories)
                let spellFlags =  (spell.flags && spell.flags[MODULE_ID]) ? spell.flags[MODULE_ID]["category"] : null;
                //0.5.3f Prior to 0.5.3f spellFlags were single values; if so, convert to an array
                if (spellFlags && !Array.isArray(spellFlags)) spellFlags = [spellFlags];
                let includedInCategory = false;
                if ((categoryType === "spellbook") || (categoryType === "view")) {
                    includedInCategory = spellFlags && spellFlags.includes(categoryKey);
                } else if (categoryType === "filter") {
                    //Include anything without a category, as well as spells with a category that is a View
                    includedInCategory = !spellFlags || (spellFlags.filter(sf => viewCategories.includes(sf)).length > 0);
                }

                includeSpell = includeSpell && includedInCategory;
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

            for (const section of spellbook) {
                const filteredSpells = this.filterSpells(section.spells, category, null);
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
        let templateFlags = customCategory?.templateFlags;
        //0.5.1aa If the showOnlyInCategory flag is set, then create a pseudo templateFlag
        if (customCategory.categoryType === "spellbook") {
            if (!templateFlags) {templateFlags = {}}
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
                //0.5.3e: Changed spell.id to spell._id, but not clear why this ever worked
                const changedItem = {_id: spell._id}
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
            //0.7.3d: sort now saves also
            this.sortCategories();
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
