/*
29-Dec-2020     0.5.1t: Only save the customCategories and merge with the standardCategories (then we don't have to upgrade standard categories)              
                Split out from Inventory+ForSpells.js for creating and deleting categories
*/

import {SpellBetterCharacterSheet} from "./SpellBetter.js";
import { MODULE_ID, SPELL_BETTER } from './constants.js';

export class Category extends FormApplication {
    constructor(category, options, inventoryPlusForSpells) {
        super(category, options);
        this.category = category;
        this.inventoryPlusForSpells = inventoryPlusForSpells;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "create-category",
            title:  game.i18n.localize("SPELL_BETTER.NewCategory.TITLE"),
            classes: ["sheet"],
            template: 'modules/spell-better/templates/categoryDialog.hbs',
            width: 420
        });
    }

    async getData(options) {
        const templateData = {
            category : this.category,
            filterSet : "Level",
            filters: SPELL_BETTER.labelFilterSets.levels.map(f => f.name)
        }
        return templateData;
    }

    async _updateObject(event, formData) {

        //If this is a new category, create it
        let key = formData.key;
        if (key) {
            //Validation
            if (formData.label === undefined || newCategory.label === '') {
                ui.notifications.error('Could not create Category as no name was specified');
                return;
            }
            //Creating a new key should be encapsulated here
            key = this.inventoryPlusForSpells?.generateCategoryId();
        } 

        let newCategory = {
            isCustom: true,
            canCreate: true, 
            canPrepare: true,
            collapsed: false,
            order: this.inventoryPlusForSpells?.getHighestSortFlag() + 1000
        }

        for (let input of formData) {
            let value = input.type === 'checkbox' ? input.checked : input.value;
            if (input.dataset.dtype === "Number") {
                value = Number(value) > 0 ? Number(value) : 0;
            }
            newCategory[input.name] = value;
        }
        if (this.inventoryPlusForSpells) {
            this.inventoryPlusForSpells.allCategories[key] = newCategory;
            this.inventoryPlusForSpells.saveCategories()
        }
;
    }

    
}//end class Category
