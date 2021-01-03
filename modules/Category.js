/*
29-Dec-2020     0.5.1t: Only save the customCategories and merge with the standardCategories (then we don't have to upgrade standard categories)              
                Split out from Inventory+ForSpells.js for creating and deleting categories
1-Jan-2021      0.5.1aa: getData(): includeInStandard -> showOnlyInCategory      
2-Jan-2021      0.5.1ac: Handle editCategory       
                0.5.1ad: Create choices structure to make mapping suitable for selectOptions Handlebars
*/

import {SpellBetterCharacterSheet} from "./SpellBetter.js";
import { MODULE_ID, SPELL_BETTER } from './constants.js';

export class Category extends FormApplication {
    constructor(categoryKey, options, inventoryPlusForSpells) {
        const categoryData = categoryKey ? inventoryPlusForSpells?.allCategories[categoryKey] : null;
        super(categoryData, options);
        this.categoryKey = categoryKey;
        this.inventoryPlusForSpells = inventoryPlusForSpells;

        //0.5.1ad: Convert filter choices to mapping suitable for selectOPtions Handlebars helper
        this.choices = {};
        for (const [filterSetKey, filters] of Object.entries(SPELL_BETTER.labelFilterSets)) {
            this.choices[filterSetKey] = {};
            for (const filter of filters) {
                const choice = filter.choice ?? filter.filter;
                this.choices[filterSetKey][choice] = filter.name;
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
        const templateData = {
            categoryKey : this.categoryKey,
            isCustom: this.object?.isCustom,
            label: this.object?.label,
            labelFilterSets : this.choices ,
            showOnlyInCategory: this.object?.showOnlyInCategory ?? false
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
            filterSets: [],
            type: "spell",
            isCustom: true,
            canCreate: false,   //Not the place to create new spells
            canPrepare: true,
            isCollapsed: false,
            order: this.inventoryPlusForSpells?.getHighestSortFlag() + 1000
        }

        for (let [input, value] of Object.entries(formData)) {
            if (value === null || value === undefined || value === "") {
                delete newCategory[input];
            } else {
                //If this is (one or more) filters, then recover the filterSets (because we use those to correctly apply)
                if (input === "filter") {
                    const filterSet = Category.findFilterSet(value);
                    if (filterSet) {
                        newCategory.filterSets.push({
                            filterSet : filterSet,
                            filters: [value]
                        });
                    }
                } else {
                    newCategory[input] = value;
                }
            }
        }
        if (this.inventoryPlusForSpells) {
            this.inventoryPlusForSpells.allCategories[categoryKey] = newCategory;
            this.inventoryPlusForSpells.saveCategories();
        }
    }

    static findFilterSet(filter) {
        if (!filter) return null;
        for (const [filterSet, filters] of Object.entries(SPELL_BETTER.labelFilterSets)) {
            if (filters.map(f => f.filter).includes(filter)) return filterSet;
        }
        return null;
    }

    
}//end class Category
