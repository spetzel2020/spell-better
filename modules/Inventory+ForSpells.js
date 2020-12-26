/*
22-Dec-2020     0.5.1: Incorporate Inventory+ (Felix Müller aka syl3r86) and implement its category and drag-and-drop tools  
                Have to copy code because overrides are too difficult
23-Dec-2020     0.5.1: - Have to null out flags.spell-better during development     
24-Dec-2020     0.5.1i: filterSpells(): loops over legal filterSets in the passed spell filters    
                0.5.1k: Check the flags as well for inclusion     
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
        let actorCategories = this.actor.getFlag(MODULE_ID, 'categories');
      
        if (!actorCategories) {
            this.customCategories = SPELL_BETTER.standardCategories;
        } else {

            this.customCategories = duplicate(actorCategories);
//FIXME
            this.customCategories = SPELL_BETTER.standardCategories;
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
    
/* Incorporated directly into SpellBetterCharacterSheet.getData()    
    static replaceGetData() {
        let oldGetData = SpellBetterCharacterSheet.prototype.getData;

        SpellBetterCharacterSheet.prototype.getData = function () {
            let app = this;
            let actor = this.actor;

            let data = oldGetData.bind(this)();
            let newInventory = InventoryPlusForSpells.processInventory(app, actor, data.inventory);
            data.inventory = newInventory;

            data.data.attributes.encumbrance.value = InventoryPlusForSpells.calculateWeight(data.inventory, actor.data.data.currency);
            data.data.attributes.encumbrance.pct = data.data.attributes.encumbrance.value / data.data.attributes.encumbrance.max * 100;
            return data;
        }
    }
*/    

    replaceOnDrop() {
        if (this.oldOnDrop === undefined) {
            this.oldOnDrop = SpellBetterCharacterSheet.prototype._onDrop;
        }
        let oldOnDrop = this.oldOnDrop;
        SpellBetterCharacterSheet.prototype._onDrop = async function (event) {
            // TODO: implement category drag'n'drop
            return oldOnDrop.bind(this)(event);
        }
    }

    replaceOnDropItem() {
        if (this.oldOnDropItem === undefined) {
            this.oldOnDropItem = SpellBetterCharacterSheet.prototype._onDropItem;
        }
        let oldOnDropItem = this.oldOnDropItem;
        SpellBetterCharacterSheet.prototype._onDropItem = async function (event, data) {
            // dropping new item
            if (data.actorId !== this.object.id || data.data === undefined) {
                return oldOnDropItem.bind(this)(event, data);
            }

  
            // doing actual stuff!!!
            let id = data.data._id;
            let dropedItem = this.object.getOwnedItem(id);
            
            let targetType = '';
            let targetCss = InventoryPlusForSpells.getCSSName("sub-header");
            if (targetLi.className.trim().indexOf(targetCss) !== -1) {
                targetType = $(targetLi).find('.item-control')[0].dataset.type;
            } else if (targetLi.className.trim().indexOf('item') !== -1) {
                let itemId = targetLi.dataset.itemId;
                let item = this.object.getOwnedItem(itemId);
                targetType = this.inventoryPlusForSpells.getSpellCategory(item.data);
            }

            // changing item list
            let itemType = this.inventoryPlusForSpells.getSpellCategory(data.data);
            if (itemType !== targetType) {
                let categoryWeight = this.inventoryPlusForSpells.getCategoryItemWeight(targetType);
                let itemWeight = dropedItem.data.totalWeight;
                let maxWeight = Number(this.inventoryPlusForSpells.customCategories[targetType].maxWeight ? this.inventoryPlus.customCategories[targetType].maxWeight : 0);

                if (maxWeight == NaN || maxWeight <= 0 || maxWeight >= (categoryWeight + itemWeight)) {
                    await dropedItem.update({ 'flags.inventory-plus.category': targetType });
                    itemType = targetType;
                } else {
                    ui.notifications.warn("Item exceedes category's max weight");
                    return;
                }
            }

            // reordering items

            // Get the drag source and its siblings
            let source = dropedItem;
            let siblings = this.object.spells.filter(i => {
                let type = this.inventoryPlusForSpells.getSpellCategory(i.data);
                return (type === itemType) && (i.data._id !== source.data._id)
            });
            // Get the drop target
            let dropTarget = event.target.closest(".item");
            let targetId = dropTarget ? dropTarget.dataset.itemId : null;
            let target = siblings.find(s => s.data._id === targetId);

            // Perform the sort
            let sortUpdates = SortingHelpers.performIntegerSort(dropedItem, { target: target, siblings });
            let updateData = sortUpdates.map(u => {
                let update = u.update;
                update._id = u.target.data._id;
                return update;
            });

            // Perform the update
            this.object.updateEmbeddedEntity("OwnedItem", updateData);
        }
    }

/* FIXME: Deprecated. Incorporated into constructor
    
    static processInventory(app, actor, inventory) {

        if (app.inventoryPlusForSpells === undefined) {
            app.inventoryPlusForSpells = new InventoryPlusForSpells();
            app.inventoryPlusForSpells.init(actor);
        }
        return app.inventoryPlusForSpells.prepareInventory(inventory);
    }


    init(actor) {
        this.actor = actor;
        this.initCategories();
        //this.replaceOnDrop();
        this.replaceOnDropItem();
    }
*/


    addInventoryFunctions(html) {
        /*
         *  create custom category 
         */
        let addCategoryBtn = $('<a class="custom-category"><i class="fas fa-plus"></i> Add Custom Category</a>').click(async ev => {
            let template = await renderTemplate('modules/inventory-plus/templates/categoryDialog.hbs', {});
            let d = new Dialog({
                title: "Creating new Inventory Category",
                content: template,
                buttons: {
                    accept: {
                        icon: '<i class="fas fa-check"></i>',
                        label: "Accept",
                        callback: async html => {
                            let input = html.find('input');
                            this.createCategory(input);
                        }
                    },
                    cancle: {
                        icon: '<i class="fas fa-times"></i>',
                        label: "Cancel"
                    }
                },
                default: "accept",
            });
            d.render(true);
        });
        html.find('.inventory-list .spells-list').prepend(addCategoryBtn);

        /*
         *  add removal function
         */

        let createBtns = html.find('.inventory-list .item-controls .item-create');
        for (let createBtn of createBtns) {
            let type = createBtn.dataset.type;
            if (['weapon', 'equipment', 'consumable', 'tool', 'backpack', 'loot'].indexOf(type) === -1) {
                let parent = createBtn.parentNode;
                let removeCategoryBtn = $(`<a class="item-control remove-category" title="Delete Category" data-type="${type}"><i class="fas fa-minus"></i> Del.</a>`);
                removeCategoryBtn.click(ev => this.removeCategory(ev));
                parent.innerHTML = '';
                $(parent).append(removeCategoryBtn);
            }
        }

        /*
         *  add extra header functions
         */

        let targetCss = `.inventory .${InventoryPlusForSpells.getCSSName("sub-header")}`;
        let headers = html.find(targetCss);
        for (let header of headers) {
            header = $(header);
            let type = header.find('.item-control')[0].dataset.type;

            let extraStuff = $('<div class="inv-plus-stuff flexrow"></div>');
            header.find('h3').after(extraStuff);

            if (this.customCategories[type] === undefined) {
                return;
            }

            // toggle item visibility
            let arrow = this.customCategories[type].collapsed === true ? 'right' : 'down';
            let toggleBtn = $(`<a class="toggle-collapse"><i class="fas fa-caret-${arrow}"></i></a>`).click(ev => {
                this.customCategories[type].collapsed = !this.customCategories[type].collapsed;
                this.saveCategories();
            });
            header.find('h3').before(toggleBtn);
            
            // reorder category
            if (this.getLowestSortFlag() !== this.customCategories[type].order) {
                let upBtn = $(`<a class="inv-plus-stuff shuffle-up" title="Move category up"><i class="fas fa-chevron-up"></i></a>`).click(() => this.changeCategoryOrder(type, true));
                extraStuff.append(upBtn);
            }
            if (this.getHighestSortFlag() !== this.customCategories[type].order) {
                let downBtn = $(`<a class="inv-plus-stuff shuffle-down" title="Move category down"><i class="fas fa-chevron-down"></i></a>`).click(() => this.changeCategoryOrder(type, false));
                extraStuff.append(downBtn);
            }

            // edit category 
            let editCategoryBtn = $('<a class="inv-plus-stuff customize-category"><i class="fas fa-edit"></i></a>').click(async ev => {
                let template = await renderTemplate('modules/inventory-plus/templates/categoryDialog.hbs', this.customCategories[type]);
                let d = new Dialog({
                    title: "Edit Inventory Category",
                    content: template,
                    buttons: {
                        accept: {
                            icon: '<i class="fas fa-check"></i>',
                            label: "Accept",
                            callback: async html => {
                                let inputs = html.find('input');
                                for (let input of inputs) {
                                    let value = input.type === 'checkbox' ? input.checked : input.value;
                                    if (input.dataset.dtype === "Number") {
                                        value = Number(value) > 0 ? Number(value) : 0;
                                    }
                                    this.customCategories[type][input.name] = value;
                                }
                                this.saveCategories();
                            }
                        },
                        cancle: {
                            icon: '<i class="fas fa-times"></i>',
                            label: "Cancel"
                        }
                    },
                    default: "accept",
                });
                d.render(true);
            });
            extraStuff.append(editCategoryBtn);

            // hide collapsed category items
            if (this.customCategories[type].collapsed === true) {
                header.next().hide();
            }

            if (this.customCategories[type].maxWeight > 0) {
                let weight = this.getCategoryItemWeight(type);
                let weightString = $(`<label class="category-weight">( ${weight}/${this.customCategories[type].maxWeight}  ${game.i18n.localize('DND5E.AbbreviationLbs')})</label>`);
                header.find('h3').append(weightString);
            }
        }
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
        this.actor.setFlag("spell-better", 'categories', { [deleteKey]:null });
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

    getCategoryItemWeight(type) {
        let weight = 0;
        for (let i of this.actor.spells) {
            if (type === this.getSpellCategory(i.data)) {
                weight += i.data.totalWeight;
            }
        }
        return weight;
    }

    static calculateWeight(inventory, currency) {
        let customWeight = 0;
        for (let id in inventory) {
            let section = inventory[id];
            if (section.ignoreWeight !== true) {
                for (let i of section.spells) {
                    customWeight += i.totalWeight;
                }
            }
            if (Number(section.ownWeight) > 0) {
                customWeight += Number(section.ownWeight);
            }
        }

        let coinWeight = 0
        if (game.settings.get("dnd5e", "currencyWeight")) {
            let numCoins = Object.values(currency).reduce((val, denom) => val += Math.max(denom, 0), 0);
            coinWeight = Math.round((numCoins * 10) / CONFIG.DND5E.encumbrance.currencyPerWeight) / 10;
        }
        customWeight += coinWeight;

        customWeight = Number(customWeight).toFixed(2);

        return customWeight;
    }

    static getCSSName(element) {
        let version = game.system.data.version.split('.');
        if (element === "sub-header") {
            if (version[0] == 0 && version[1] <= 9 && version[2] <= 8) {
                return "inventory-header";
            } else {
                return "items-header";
            }
        }
    }

    async saveCategories() {
        //this.actor.update({ 'flags.inventory-plus.categories': this.customCategories }).then(() => { console.log(this.actor.data.flags) });
//FiXME: Need to null it during development, because if you change the format it remembers the old extraneous info        
        await this.actor.setFlag(MODULE_ID, "categories", null);
        await this.actor.setFlag(MODULE_ID, 'categories', this.customCategories);
    }
}//end InventoryPlusForSpells
