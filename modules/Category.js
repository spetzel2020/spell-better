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
*/

import { MODULE_ID, SPELL_BETTER } from './constants.js';

export class Category extends FormApplication {
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
            view:  "SPELL_BETTER.NewCategory.ViewOrSpellbook.VIEW",
            spellbook: "SPELL_BETTER.NewCategory.ViewOrSpellbook.SPELLBOOK"
        }

        const templateData = {
            categoryKey : this.categoryKey,
            isCustom: this.object?.isCustom,
            label: this.object?.label,
            labelFilterSets : this.choices ,
            selectedFilters: selectedFilters,
            types: types,
            selectedType: this.object?.categoryType
        }
        return templateData;
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

        let newCategory = {
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
                delete newCategory[input];
            } else {
                //If this is (one or more) filters, then recover the filterSets (because we use those to correctly apply)
                if (input === "filter") {
                    const {filterSetKey,label} = Category.findFilterSet(value);
                    if (filterSetKey) {
                        if (!newCategory.labelFilterSets[filterSetKey]) newCategory.labelFilterSets[filterSetKey] = [];
                        newCategory.labelFilterSets[filterSetKey].push(label);
                    }
                } else {
                    newCategory[input] = value;
                }
            }
        }

        //0.5.3e Set appropriate templateFlags (for new or dragged spells)
        //This is NOT an array - spells can have multiple View categories, but Views and SPellbooks just have/apply one
        newCategory.templateFlags = {category: categoryKey};
        //Don't have set filterFlags because we use the categoryType setting
        if (this.inventoryPlusForSpells) {
            this.inventoryPlusForSpells.allCategories[categoryKey] = newCategory;
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

    
}//end class Category
