/*
29-Dec-2020     0.5.1t: Only save the customCategories and merge with the standardCategories (then we don't have to upgrade standard categories)              
                Split out from Inventory+ForSpells.js for creating and deleting categories
1-Jan-2021      0.5.1aa: getData(): includeInStandard -> showOnlyInCategory      
2-Jan-2021      0.5.1ac: Handle editCategory       
                0.5.1ad: Create choices structure to make mapping suitable for selectOptions Handlebars
                0.5.1ae findFilterSet(): Quick hack to check the constructed choice field too    
3-Jan-2021      0.5.2a: Switch to SPELL_BETTER.labelFilterSets format more consistent with selectOPtions
5-Jan-2021      0.5.3e: Change to a simple View or Spellbook selector
                0.5.3k: Sort after adding a new category and before saving
10-Jan-2021     0.7.3: _updateObject(): Don't save after sorting (done in sortCategories())       
25-Jan-2021     0.7.5: activateListeners(): Add on select.change() so that we enable/disable Filters depending on whether it's a Filter type         
26-Jan-2021     0.8.0: Switch to referencing spells in category rather than category in spells
                Filter: No effect (automatic)
                Spellbook/View: For now don't change the list of spells and see what happens
27-Jan-2021     0.8.1: Copy spellIds from old to new category (even if you change just the name)                
*/

import { MODULE_ID, SPELL_BETTER } from './constants.js';

export class CategorySheet extends FormApplication {
    constructor(categoryKey, options, inventoryPlusForSpells) {
        const categoryData = categoryKey ? inventoryPlusForSpells?.allCategories[categoryKey] : null;
        super(categoryData, options);
        this.categoryKey = categoryKey;
        this.inventoryPlusForSpells = inventoryPlusForSpells;

        //0.5.1ad: Convert filter choices to mapping suitable for selectOPtions Handlebars helper
        this.choices = {};
        for (const [filterSetKey, labelFilters] of Object.entries(SPELL_BETTER.labelFilterSets)) {
            this.choices[filterSetKey] = {};
            for (const [labelFilterKey, labelFilter] of Object.entries(labelFilters)) {
                this.choices[filterSetKey][labelFilterKey] = labelFilter.name;
            }
        }

    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "create-category",
            title:  game.i18n.localize("SPELL_BETTER.NewCategory.TITLE"),
            classes: ["sheet","combat-sheet"],
            template: 'modules/spell-better/templates/categoryDialog.hbs',
            width: 420
        });
    }

    async getData(options) {
        //0.5.1ae: Populate selectedArray to pre-select for existing categories

        let selectedFilters = [];
        if (this.object) {
            for (const [filterSetKey, filters] of Object.entries(this.object?.labelFilterSets)) {
                const sbEntries = Object.entries(SPELL_BETTER.labelFilterSets[filterSetKey]);
                const labels = sbEntries.filter(entry => filters.includes(entry[1].label)).map(entry => entry[0]);
                selectedFilters = selectedFilters.concat(labels);
            }
        }
        const types = {
            view:  "SPELL_BETTER.NewCategory.Type.VIEW",
            filter: "SPELL_BETTER.NewCategory.Type.FILTER",            
            spellbook: "SPELL_BETTER.NewCategory.Type.SPELLBOOK"
        }
        const hideFilters = (this.object?.categoryType !== "filter");
        const templateData = {
            categoryKey : this.categoryKey,
            isCustom: this.object?.isCustom,
            label: this.object?.label,
            types: types,
            selectedType: this.object?.categoryType,
            hideFilters: hideFilters,      //trigger this from the type
            labelFilterSets : this.choices ,
            selectedFilters: selectedFilters
        }
        return templateData;
    }

    activateListeners(html) {
        super.activateListeners(html);

        //Disable the filters unless you pick "Filters"
        html.find("select#categoryType").change(ev => {
            const categoryType = ev.currentTarget.value;
            html.find("select#filter").prop("disabled",(categoryType !== "filter"));
        });
    }

    async _updateObject(event, formData) {

        //If this is a new category, create it
        let categoryKey = formData.categoryKey;
        if (!categoryKey) {
            //Validation
            if (!formData.label || formData.label === '') {
                ui.notifications.error('Could not create Category as no name was specified');
                return;
            }
            //Creating a new key should be encapsulated here
            categoryKey = this.inventoryPlusForSpells?.generateCategoryId();
        } 

        let newCategoryData = {
            label: formData.label,
            labelFilterSets: {},
            type: "spell",
            isCustom: true,
            canCreate: false,   //Not the place to create new spells
            canPrepare: true,
            isCollapsed: false,
            categoryType: "view",
            order: this.inventoryPlusForSpells?.getHighestSortFlag()-1  //Otherwise we would have to sort and decorate the move up/down
        }

        for (let [input, value] of Object.entries(formData)) {
            if (value === null || value === undefined || value === "") {
                delete newCategoryData[input];
            } else {
                //If this is (one or more) filters, then recover the filterSets (because we use those to correctly apply)
                if (input === "filter") {
                    const {filterSetKey,label} = CategorySheet.findFilterSet(value);
                    if (filterSetKey) {
                        if (!newCategoryData.labelFilterSets[filterSetKey]) newCategoryData.labelFilterSets[filterSetKey] = [];
                        newCategoryData.labelFilterSets[filterSetKey].push(label);
                    }
                } else {
                    newCategoryData[input] = value;
                }
            }
        }

        //0.5.3e DEPRECATED: Set appropriate templateFlags (for new or dragged spells)
        //This is NOT an array - spells can have multiple View categories, but Views and SPellbooks just have/apply one
        //0.8.0 DEPRECATED: No longer are setting flags on spells so don't need templateFlags
        //newCategory.templateFlags = {category: categoryKey};
        //Don't have set filterFlags because we use the categoryType setting
        if (this.inventoryPlusForSpells) {
            //0.8.0 If type is now "filter" there should be no saved spells (shouldn't be anyway since we're building from scratch)
            if (newCategoryData.categoryType === "filter") {
                delete newCategoryData.spellIds;
            } else {
                //Make sure we don't silently keep old filters
                newCategoryData.labelFilterSets = {};
                newCategoryData.spellIds = this.inventoryPlusForSpells.allCategories[categoryKey]?.spellIds;
                //If you switched from View->Spellbook, then those spells will be removed from other Views
                //If you switch from Spellbook -> View, then those spells are now part of your Known spells
            }
            this.inventoryPlusForSpells.allCategories[categoryKey] = newCategoryData;
            //0.5.3k: Sort after adding a new category and before saving
            //0.7.3: Also saves
            this.inventoryPlusForSpells.sortCategories();
        }
    }

    static findFilterSet(filter) {
        if (!filter) return null;
        for (const [filterSetKey, filters] of Object.entries(SPELL_BETTER.labelFilterSets)) {
            //0.5.1ae Quick hack to check the constructed choice field too
            for (const [fKey, f] of Object.entries(filters)) {
                if (fKey === filter) return {filterSetKey, label: f.label};
            }
        }
        return null;
    }

    
}//end class CategorySheet
