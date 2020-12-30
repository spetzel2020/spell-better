/*
29-Dec-2020     0.5.1t: Only save the customCategories and merge with the standardCategories (then we don't have to upgrade standard categories)              
                Split out from Inventory+ForSpells.js for creating and deleting categories
*/

import {SpellBetterCharacterSheet} from "./SpellBetter.js";
import { MODULE_ID, SPELL_BETTER } from './constants.js';

export class Category extends FormApplication {
    constructor(category, options, inventoryPlusForSpells) {
        super(category, options);
//FIXME        
        this.key = null;
        this.category = category;
        this.inventoryPlusForSpells = inventoryPlusForSpells;
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
            key: this.key,
            category : this.category,
            labelFilterSets : SPELL_BETTER.labelFilterSets ,
            includeInStandard: this.category?.includeInStandard ?? true
        }
        return templateData;
    }

    async _updateObject(event, formData) {

        //If this is a new category, create it
        let key = formData.key;
        if (!key) {
            //Validation
            if (!formData.label || formData.label === '') {
                ui.notifications.error('Could not create Category as no name was specified');
                return;
            }
            //Creating a new key should be encapsulated here
            key = this.inventoryPlusForSpells?.generateCategoryId();
        } 

        let newCategory = {
            label: formData.label,
            filterSets: [],
            type: "spell",
            isCustom: true,
            canCreate: true, 
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
            this.inventoryPlusForSpells.allCategories[key] = newCategory;
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
