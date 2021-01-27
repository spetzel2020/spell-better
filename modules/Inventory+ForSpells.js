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
                Also call saveCategories()
23-Jan-2021     0.7.4: Have to sort after categorizing, because filters could have removed a category from view which would change the first/last   
24-Jan-2021     0.7.4c: Don't sort after categorizing; in sortCategories() just show/hide rather than removing
                setFirstAndLast(): Moved to call from categorizeSpells(); Ignore hidden categories for the purposes of isFirst and isLast   
                Potentially brekaing change: categorizeSpells() is mutating on allCategories; before was just passing back a categorized version for display 
25-Jan-2021     v0.7.5: Reverse order of merge so that changes to standard, custom categories (Rituals, Wanted) are saved                         
26-Jan-2021     v0.8.0: Add migrateSpells() to remove spell-better category flags and make sure they are in the right category
                filterSpells(): Exclude from type "filter" if it's in a spellbook
*/

import {CategorySheet} from "./Category.js";
import { MODULE_ID, MODULE_VERSION, SPELL_BETTER } from './constants.js';

export class InventoryPlusForSpells {
    constructor(actor) {
        this.actor = actor;
        //0.8 includes migrating from old version
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
        //v0.7.5: Reverse order of merge so that changes to standard, custom categories (Rituals, Wanted) are saved
        this.allCategories = mergeObject(SPELL_BETTER.standardCategories, customCategories);
        //And now apply info about collapsed/shown (the only reason we saved)
        for (const category of Object.keys(this.allCategories)) {
            if (savedCategories && savedCategories[category]) {
                this.allCategories[category].isCollapsed = savedCategories[category].isCollapsed;
            }
        }
        //v0.8.0: Move categories off spells; put spells into categories
        this.migrateSpells();
        this.sortCategories();
    }

    migrateSpells() {
        //0.8.0 Migrate existing spells to make sure they don't contain category information
        const changedItemData = [];
        for (const item of this.actor.items) {
            const flagData = item.data?.flags?.[MODULE_ID];
            if (flagData) {
                //Add the spell to the category if the category exists (could be multiple)
                let spellCategories = flagData.category;
                if (spellCategories) {
                    //Allow for the historic saving of single categories rather than an array
                    if (!Array.isArray(spellCategories)) {spellCategories = [spellCategories];}
                    for (const categoryKey of spellCategories) {
                        if (this.allCategories[categoryKey]) {
                            this.addSpell(categoryKey, item.data._id);
                        }
                    }
                }

                //Delete the categories on the spell (could be one or an array)
                delete item.data.flags[MODULE_ID];
                changedItemData.push(item.data);
            }
        }
        //Batch update the spells
        if (changedItemData.length) {
//FIXME: This does not remove the flag - need a special format
//Keep it for testing right now            
           this.actor.updateEmbeddedEntity("OwnedItem", changedItemData);
        }
    }

    
    sortCategories() {
        let sortedCategories = {};

        let sortedKeys = Object.keys(this.allCategories);
        sortedKeys.sort((a, b) => {
            return this.allCategories[a].order - this.allCategories[b].order;
        });
        //0.7.3d: Renumber the order while sorting
        for (const [index,key] of sortedKeys.entries()) {
            sortedCategories[key] = this.allCategories[key];
            sortedCategories[key].order = 10 * index;
        }
        this.allCategories = sortedCategories;

        this.saveCategories();
    }

    setFirstAndLast() {
        //0.7.4: Ignore hidden categories for the purposes of isFirst and isLast
        let firstShownKey = null;
        let lastShownKey = null;
        for (const [key, category] of Object.entries(this.allCategories)) {
            if (category.isShown) {
                this.allCategories[key].isLast = false;
                lastShownKey = key;
                if (!firstShownKey) {
                    this.allCategories[key].isFirst = true;
                    firstShownKey = key;
                } else {
                    this.allCategories[key].isFirst = false;
                }
            }
        }
        //For last key, we don't set it until the last one found
        if (lastShownKey) {this.allCategories[lastShownKey].isLast = true;}
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
            if (!includeSpell) {return includeSpell;}

            //0.8.0: See if the category lists this spell - if it's type "filter" then we dealt with it above
            //If it's a filter then don't include spells that are in separate spellbooks (you'll have to make another copy)
            if (categoryType === "filter") {
                const spellbookCategories = Object.values(this.allCategories).filter(v => (v.categoryType === "spellbook"));
                for (const category of spellbookCategories) {
                    //A spellbook has this spell
                    if (category.spellIds?.has && category?.spellIds?.has(spell._id)) {return false;}
                }
                return true;
            } else if (["view","spellbook"].includes(categoryType)) {
                return category?.spellIds?.has && category?.spellIds?.has(spell._id)
            }//end if includeSpell
            //categoryType===all
            return true;
        });
    }

    categorizeSpells(spellbook) {
        //0.8.0 Don't duplicate() because it doesn;t work with Sets
        let categories = this.allCategories;
        

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
            //Now sort spells within categories - should make this configurable
            categories[category].spells.sort((a, b) => {
                return a.sort - b.sort;
            });

            //0.5.1x: If (default) hide standard categories with no spells, remove them for display
            //0.7.4: We don't remove them, just mark them to not be displayed
            categories[category].isShown = !game.settings.get(MODULE_ID, SPELL_BETTER.hideCategoryWithNoSpells)
                                            || value.isCustom || value.spells?.length;
        }

        //0.7.4 Now set first/last for display
        this.allCategories = categories;
        this.setFirstAndLast();
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

    addSpell(categoryKey, spellId) {
        if (!categoryKey || !spellId) {return;}
        //0.8.0: Don't set flags for the spell; instead we record in the category if it's View or Spellbook
        const categoryData = this.allCategories[categoryKey];
        if (categoryData && (categoryData.categoryType !== "filter")) {
            if (!categoryData.spellIds || !categoryData.spellIds.size) {categoryData.spellIds = new Set();}
            categoryData.spellIds.add(spellId);
        }
    }

    removeSpell(spellId) {
        if (!spellId) {return;}
        //0.8.0 Remove spell from existing categories if they are Spellbook type
//FIXME: What if you move a spell from a View to a Spellbook? It should disappear? - For now it will be a copy
        for (const category of Object.values(this.allCategories)) {
            category.spellIds?.delete(spellId);
        }        
    }

    async newCategory() {
        new CategorySheet(null, {}, this).render(true);
    }

    async editCategory(categoryKey) {
        new CategorySheet(categoryKey, {}, this).render(true);
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
        //0.8.0: Don't set categories to null because it forces a re-render with no categories
        //await this.actor.setFlag(MODULE_ID, SPELL_BETTER.categories_key, null);
        await this.actor.setFlag(MODULE_ID,  SPELL_BETTER.categories_key, this.allCategories);
        //0.5.1s: Save the categoryVersion (which means we need to do any upgrading on read)
        await this.actor.setFlag(MODULE_ID, SPELL_BETTER.categoriesVersion_key, SPELL_BETTER.categoriesVersion);
    }
}//end InventoryPlusForSpells
