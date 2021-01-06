/*
10-Dec-2020     0.5.0: Forked from Calego/foundryVTT_5eOGL sheet
15-Dec-2020     0.5.0: Make filter sets ORs
16-Dec-2020     0.5.0: Add To Hit and Damage "pop-up" buttons to allow continued damage rerolls from sheet
                Override _filterItems so that spells get filtered here only
                Move abbreviated activation labels and setting of Ritual, Concentration, and Prepared labels fr filters
21-Dec-2020     0.5.0: Add a Print option to the header buttons  
22-Dec-2020     0.5.1: Incorporate a copied/mangled Inventory+  and implement its category and drag-and-drop tools        
23-Dec-2020     0.5.1c: Attach listeners to toggle category collapsed/shown - loop through    
26-Dec-2020     0.5.1p: _onDropItem(): If flags are different (because of different category) then udpate them first
                0.5.1q: Check both sub-header and item-list parents (because the header and the list are in parallel trees)
27-Dec-2020     Attach the toggle to the caret, not to the whole line   
30-Dec-2020     0.5.1w: Add Delete Custom Category control         
                Don't overwrite spellbook; just add categories    
2-Jan-2021      0.5.1ab: Add Move Category up/down controls      
                0.5.1ac: Add Edit Category control; remove down or up at top of list    
3-Jan-2021      0.5.2e: Add toggle Filter visibility    
4-Jan-2021      0.5.3: Standalone version that will pop up from Spellbook tab      
                0.5.3c: Remove header from popup spellbook
                0.5.3d: Basic working pop-up spell sheet from other Character Sheets
5-Jan-2021      0.5.3f: Add/remove categories when you drop a spell in a new place      
                0.5.3g: getData(): Moved initialization of inventoryPlusForSpells here because we need it for calling filterSpells          

*/

import { log, getActivationType, getWeaponRelevantAbility, hasAttack, hasDamage } from './helpers.js';
import { registerSettings } from './settings.js';
import { preloadTemplates } from './preloadTemplates.js';
import { MODULE_ID, MODULE_VERSION, SPELL_BETTER } from './constants.js';
import {InventoryPlusForSpells} from './Inventory+ForSpells.js';

import ActorSheet5eCharacter from '../../../systems/dnd5e/module/actor/sheets/character.js';


/* HANDLEBARS HELPERS */
Handlebars.registerHelper('spell-better-sheet-path', (relativePath) => {
  return `modules/${MODULE_ID}/${relativePath}`;
});

Handlebars.registerHelper('ogl5e-sheet-safeVal', (value, fallback) => {
  return new Handlebars.SafeString(value || fallback);
});

Handlebars.registerHelper('ogl5e-sheet-add', (value, toAdd) => {
  return new Handlebars.SafeString(String(value + toAdd));
});

Handlebars.registerHelper('ogl5e-sheet-isEmpty',(input) => {
  if (!input) {
    return true;
  }
  if (input instanceof Array) {
    return input.length < 1;
  }
  if (input instanceof Set) {
    return input.size < 1;
  }
  return isObjectEmpty(input);
});


export class SpellBetterCharacterSheet extends ActorSheet5eCharacter {

    get template() {
        //@ts-ignore
        if (!game.user.isGM && this.actor.limited && !game.settings.get(MODULE_ID, SPELL_BETTER.expandedLimited)) {
            return `modules/${MODULE_ID}/templates/character-sheet-ltd.hbs`;
        }

        return `modules/${MODULE_ID}/templates/character-sheet.hbs`;
    }


    static get defaultOptions() {
        const options = super.defaultOptions;

        mergeObject(options, {
        classes: ['dnd5e', 'sheet', 'actor', 'character', 'spell-better-sheet'],
        height: 680,
        width: 830,
        });

        return options;
    }

  /**
   * Handle rolling an Ability check, either a test or a saving throw
   * @param {Event} event   The originating click event
   * @private
   */
  _onRollAbilitySave(event) {
    event.preventDefault();
    let ability = event.currentTarget.parentElement.dataset.ability;

    //@ts-ignore
    this.actor.rollAbilitySave(ability, { event: event }); // FIXME TS
  }

  /**
   * Change the quantity of an Owned Item within the Actor
   * @param {Event} event   The triggering click event
   * @private
   */
  async _onQuantityChange(event) {
    event.preventDefault();
    const itemId = event.currentTarget.closest('.item').dataset.itemId;
    // @ts-ignore
    const item = this.actor.getOwnedItem(itemId);
    const quantity = parseInt(event.target.value);
    event.target.value = quantity;
    return item.update({ 'data.quantity': quantity });
  }

    /**
     * Override onItemCreate with creating a new spell not from the header information but from the category
     */
    async _onSpellCreate(event) {
        event.preventDefault();
        const header = event.currentTarget;
        const category = header.dataset.category;
        const {templateItemData, templateFlags} = this.inventoryPlusForSpells.getTemplateItemData(category);
        const newSpellData =  await this.actor.createEmbeddedEntity("OwnedItem", templateItemData);
        const newSpell = this.actor.getOwnedItem(newSpellData?._id);
//FIXME: Yuck - is there a batched way of doing this with update?
        if (newSpell && templateFlags) {
            for (const [flagKey, flagValue] of Object.entries(templateFlags)) {
                await newSpell.setFlag(MODULE_ID,flagKey, flagValue);
            }
        }
    }   
    
    /**
     * @override
     * _onDropItem: Note where dropped to see if you have to apply category info
     */
    async _onDropItem(event, data) {
        //Copied from core _onDropItem()
        if ( !this.actor.owner ) return false;
        const item = await Item.fromDropData(data);
        const itemData = duplicate(item.data);

        //Check if you dropped it on the header, or on the list inside the header
        let targetLi = $(event.target).closest("li.sub-header")[0] ?? $(event.target).closest("ol.item-list")[0];
  
        // dropping item outside category list
        if (targetLi === undefined || targetLi.className === undefined) {
            return super._onDropItem(event, data);
        }

        const category = targetLi.dataset?.category;
        const templateFlags = this.inventoryPlusForSpells.getTemplateItemData(category)?.templateFlags;
        //If the flags are different than current (because we're dropping in a different category) then update them first
        //(This allows the default sorting to work if we are dropping from within)
        if ((itemData.flags && itemData.flags[MODULE_ID]) || templateFlags) {
            if (!itemData.flags) {itemData.flags = {}}

            //0.5.3: Remove any of the spell's spellbook type categories
            let spellCategories = itemData.flags[MODULE_ID] ? itemData.flags[MODULE_ID]["category"] : null;
            if (spellCategories) {
                //If not an array, turn it into one
                if (!Array.isArray(spellCategories)) {spellCategories = [spellCategories];}
                spellCategories = spellCategories.filter(sc => (this.inventoryPlusForSpells?.allCategories[sc] !== "spellbook"));
            }
            //Add any new templateFlags
            if (templateFlags) spellCategories = (spellCategories ?? []).concat(templateFlags["category"]);
            if (!itemData.flags[MODULE_ID]) {itemData.flags[MODULE_ID] = {}}
            itemData.flags[MODULE_ID]["category"] = spellCategories;  //turn undefined into null
            await this.actor.updateEmbeddedEntity("OwnedItem", itemData);
        }

        // Handle item sorting within the same Actor
        const actor = this.actor;
        let sameActor = (data.actorId === actor._id) || (actor.isToken && (data.tokenId === actor.token.id));
        if (sameActor) return this._onSortItem(event, itemData);

        // Create the owned item
        return this._onDropItemCreate(itemData);
    }

    /** @override */       
    _getHeaderButtons() {
        let buttons = super._getHeaderButtons();
        let printButton = buttons.findIndex(button => button.label === game.i18n.localize("Close"));

        buttons.unshift({
            label: "SPELL_BETTER.Print",
            class: "entry-image",
            icon: "fas fa-print",
            onclick: ev => {
                this.createWindowedSheet(this.id);              
            }
        })
        return buttons;
    }

    /*---------------
    /* PINCHED from popout.js
    /*----------------*/
    windowFeatures(app) {
        let windowFeatures = undefined;
        if (game.settings.get("popout", "useWindows")) {
            const padding = 30;
            const innerWidth = app.element.innerWidth() + padding * 2;
            const innerHeight = app.element.innerHeight() + padding * 2;
            const position = app.element.position(); // JQuery position function.
            const left = window.screenX + position.left - padding;
            const top = window.screenY + position.top - padding;
            windowFeatures = `toolbar=0, location=0, menubar=0, titlebar=0, scrollbars=1, innerWidth=${innerWidth}, innerHeight=${innerHeight}, left=${left}, top=${top}`;
        }
        return windowFeatures;
    }

    createWindow(features) {
        const popout = window.open("about:blank", "_blank", features);
        popout.location.hash = "popout";
        popout._rootWindow = window;
        //this.log("Window opened", popout);
        return popout;
    }

    createDocument() {
        // Create the new document.
        // Currently using raw js apis, since I need to ensure
        // jquery isn't doing something sneaky underneath.
        // In particular it makes some assumptions about there
        // being a single document.
        // We do this before opening the window because technically writing
        // to the new window is race condition with the page load.
        // But since we are directing to a placeholder file, it doesn't matter other than for UX purposes.
        const html = document.createElement("html");
        const head = document.importNode(document.getElementsByTagName("head")[0], true);
        const body = document.importNode(document.getElementsByTagName("body")[0], false);

        for (const child of [...head.children]) {
            if (child.nodeName === "SCRIPT" && child.src) {
                const src = child.src.replace(window.location.origin, "");
                if (!src.match(/tinymce|jquery|webfont|pdfjs/)) {
                    child.remove();
                }
            }
        }

        html.appendChild(head);
        html.appendChild(body);
        return html;
    }

    createWindowedSheet(domID) {
        const app = this;
        const windowFeatures = this.windowFeatures(app);

        // -------------------- Obtain application --------------------
        const state = {
            app: app,
            node: app.element[0],
            position: duplicate(app.position),
            minimized: app._minimized,
            display: app.element[0].style.display,
            css: app.element[0].style.cssText,
            children: [],
        };

        // --------------------------------------------------------

        const popout = this.createWindow(windowFeatures);

        if (!popout) {
            ui.notifications.warn(game.i18n.localize("POPOUT.failureWarning"));
            return;
        }

        // We have to clone the header element and then remove the children
        // into it to ensure that the drag behavior is ignored.
        // however we have to manually move the actual controls over,
        // so that their event handlers are preserved.
/*        
        const shallowHeader = state.header.cloneNode(false);
        shallowHeader.classList.remove("draggable");
        for (const child of [...state.header.children]) {
            if (child.id == domID) {
                // Change Close button
                $(child).html(`<i class="fas fa-sign-in-alt"></i>${game.i18n.localize("POPOUT.PopIn")}`).off('click').on('click', ev => {
                    popout._popout_dont_close = true;
                    popout.close();
                })
            }
            shallowHeader.appendChild(child);
        }
        // re-parent the new shallow header to the app node.
        state.node.insertBefore(shallowHeader, state.node.children[0]);
*/
        // -------------------- Write document --------------------

        const serializer = new XMLSerializer();
        const doctype = serializer.serializeToString(document.doctype);

        const srcDoc = this.createDocument();
        const targetDoc = popout.document;

        targetDoc.open();
        targetDoc.write(doctype);
        targetDoc.write(srcDoc.outerHTML);
        targetDoc.close();
        targetDoc.title = app.title;

        // We wait longer than just the DOMContentLoaded
        // because of how the document is constructed manually.
       
        popout.addEventListener("load", async (event) => {
            const body = event.target.getElementsByTagName("body")[0];
            const importedNode = targetDoc.importNode(state.node, true);
            //Remove the header controls and the draggable handle
            const header = importedNode.querySelector(".window-header");
            if (header) {
                header.remove();
            }

            const handle = importedNode.querySelector(".window-resizable-handle");
            if (handle) {
                handle.remove();
            }

            body.style.overflow = "auto";
            body.append(importedNode);

            importedNode.style.cssText = `
                display: flex;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                margin: 0 !important;
                border-radius: 0 !important;
                cursor: auto !important;
            `; // Fullscreen
/*            
            app.setPosition({ width: "100%", height: "100%", top: 0, left: 0 });
            app._minimized = null;
*/
        });
        
        //Wait 3 seconds, then print; there is probably a hook to wait for full rendering
        setTimeout(() => {popout.print()}, 3000);
  
    }

    //DEPRECATED
    async printContent(document) {
        const printableContent = document.children[0].outerHTML;
        const printWindow = window.open("", "Print_Content", 'scrollbars=1,width=900,height=900,top=' + (screen.height - 700) / 2 + ',left=' + (screen.width - 700) / 2);
        if (!printWindow) return false;
        printWindow.document.write(printableContent);
        printWindow.document.close();
        printWindow.focus();
        //printWindow.print();
        //printWindow.close();
        return false;
    }

  /** 
   * @override 
   * Activate event listeners using the prepared sheet HTML
   * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
   */
  activateListeners(html) {
    super.activateListeners(html);
    //@ts-ignore
    if (!this.options.editable) return; // FIXME TS

    // Saving Throws
    html.find('.saving-throw-name').click(this._onRollAbilitySave.bind(this));

    // Item Quantity
    html
      .find('.item-quantity input')
      .click((ev) => ev.target.select())
      .change(this._onQuantityChange.bind(this));

    //Spell Damage and To Hit shortcuts
        html.find('.spellAttack').click(ev => {
        let itemId = ev.currentTarget.closest(".item").dataset.itemId;
        let item = this.actor.getOwnedItem(itemId);
        item.rollAttack();
    })
    html.find('.spellDamage').click(ev => {
        let itemId = ev.currentTarget.closest(".item").dataset.itemId;
        let item = this.actor.getOwnedItem(itemId);
        item.rollDamage();
    })

    //Hide the shortcuts until you hover
    html.find('.item-shortcuts').hide();

    html.find('.item').hover(evIn => {
        $(evIn.target).parents('.item').find('.item-shortcuts').show();
    }, evOut => {
        $(evOut.target).parents('.item').find('.item-shortcuts').hide();
    });

    //Replace Item create for spells
     html.find('.spell-create').click(this._onSpellCreate.bind(this));

    //Pop-up custom category dialog
    html.find(".custom-category").click(async ev => {
       this.inventoryPlusForSpells?.newCategory();
    });

    //Toggle control on filters list (always starts shown)
    const toggleFilters = html.find(".toggle-line");
    if ((this.actor.filtersIsCollapsed === null) || (this.actor.filtersIsCollapsed === undefined)) {this.actor.filtersIsCollapsed = false;}
    const thisActor = this.actor;
    if (toggleFilters.length) {
        const caretDown = toggleFilters.find("#caret-down");
        const caretRight = toggleFilters.find("#caret-right");
        toggleFilters.click(async ev => {
            thisActor.filtersIsCollapsed = !thisActor.filtersIsCollapsed;
            const inventoryFilters = html.find(".inventory-filters");
            if (thisActor.filtersIsCollapsed) {
                inventoryFilters.hide();
                caretDown.hide();
                caretRight.show();
            } else {
                inventoryFilters.show();
                caretDown.show();
                caretRight.hide();            
            }
        });
    }

    //Attach listeners to toggle category collapsed/shown and move up/down - loop through
    const categoryHeaders = html.find(".sub-header");
//FIXME: For a brand-new sheet, this may be null; use a singleton call to do this
    const inventoryPlusForSpells = this.inventoryPlusForSpells;
    for (const header of categoryHeaders) {
        const el = $(header);
        const categoryKey = el[0].dataset.category;
        if (categoryKey) {
            //0.5.1s Attach the toggle to the caret, not to the whole line
            const toggle = el.find(".toggle-collapse");
            if (toggle.length) {
                toggle.click(async ev => {
                    inventoryPlusForSpells.allCategories[categoryKey].isCollapsed = !inventoryPlusForSpells.allCategories[categoryKey].isCollapsed;
                    inventoryPlusForSpells.saveCategories(categoryKey);
                });
            }
            //0.5.1ab: Move category
            const shuffleUp = el.find(".shuffle-up");
            if (shuffleUp.length) {
                shuffleUp.click(async ev => {
                    this.inventoryPlusForSpells.changeCategoryOrder(categoryKey, true);
                });
            }
            const shuffleDown = el.find(".shuffle-down");
            if (shuffleDown.length) {
                shuffleDown.click(async ev => {
                    this.inventoryPlusForSpells.changeCategoryOrder(categoryKey, false);
                });
            }
            //0.5.1ac: Edit Category
            const editCategory = el.find(".customize-category");
            if (editCategory.length) {
                editCategory.click(async ev => this.inventoryPlusForSpells?.editCategory(categoryKey));
            }


            //0.5.1u Delete category
            const delCategory = el.find(".remove-category");
            if (delCategory.length) {
                delCategory.click(async ev => inventoryPlusForSpells.removeCategory(categoryKey));
            }
        }
    }
  }

  //Spell Better 0.5.0 - Have to override _filterItems because it only does activation.type as an AND
    /**
   * Determine whether an Owned Item will be shown based on the current set of filters
   * @override
   * @return {boolean}
   * @private
   */
  _filterItems(items, filters) {
    //If these are spells, leave them out of the filter and then add them back
    const spells = items.filter(item => item.type === "spell");
    const itemsWithoutSpells = items.filter(item => item.type !== "spell");
    return super._filterItems(itemsWithoutSpells, filters).concat(spells);
  }

  getData() {
    const sheetData = super.getData();
    //Spell Better 0.5.0: Further filter by any spell label element
    //MUTATES spellbook
    
    //This is purely for Handlebars to generate the right output - the filter tags at the top of the page
    //FIXME: May want to add the list of custom tags
    sheetData.filters.choices = SPELL_BETTER.labelFilterSets;
    //0.5.3g: Moved initialization of inventoryPlusForSpells here because we need it for calling filterSpells
    if (!this.inventoryPlusForSpells) {
        this.inventoryPlusForSpells = new InventoryPlusForSpells(this.actor);
    }

    //To make filtering easier we decorate each spell with labels here for Activation type and Other (Concentration, Prepared, Ritual)
    try {
      // MUTATES sheetData
      sheetData?.spellbook.forEach(({ spells }) => {
        spells.forEach((spell) => {
            //1 Action, Reaction, Bonus, Minute, Hour etc.
            const newActivationLabel = spell.labels.activation
                .split(' ')
                .map((string, index) => {
                // ASSUMPTION: First "part" of the split string is the number
                if (index === 0) {
                    return string;
                }
                // ASSUMPTION: Everything after that we can safely abbreviate to be just the first character
                return string.substr(0, 1);
                })
                .join(' ');

            spell.labels.activationAbbrev = newActivationLabel;

            //Logic and data source copied from ActorSheet5e._filterItems()
            //Need one for each because these are AND conditions
            if (spell.data?.components?.ritual) {spell.labels.ritual = "ritual";}
            if (spell.data?.components?.concentration) {spell.labels.concentration = "concentration";}
            if (spell.data.level === 0 || ["innate", "always"].includes(spell.data.preparation.mode) || (spell.data.preparation.prepared)) {
                spell.labels.prepared = "prepared";
            }
        });
      });
    } catch (e) {
      log(true, 'error trying to modify activation labels', e);
    }

    //FILTERING: Filter overall spell list here to reduce what we have to work with
    try {
        // MUTATES sheetData
        //0.5.0j: Filters are ORd within each filter set and ANDd together across filter sets
        //Have to reconstruct the filterSets because the standard sheet only gives us a set of tags
        let appliedFilterSets = [];
        const taggedFilters = Array.from(sheetData.filters.spellbook);
        for (const [filterSet, filters] of Object.entries(sheetData.filters.choices)) {
            const filterLabelsArray = Object.values(filters).map(v => v.label);
            const appliedFilters = filterLabelsArray.filter(fl => taggedFilters.includes(fl));
            if (appliedFilters.length) {
                appliedFilterSets[filterSet] = appliedFilters;
            }
        }
        sheetData?.spellbook.forEach((sbi, index) => {
            //Not really InventoryPlus, but fits the filtering and categorization
            sheetData.spellbook[index].spells = this.inventoryPlusForSpells?.filterSpells(sbi.spells, null, appliedFilterSets);
        
        });
    } catch (e) {
        log(true, 'error trying to filter spells', e);
    }

    // within each activation time, we want to display: Items which do damange, Spells which do damage, Features
    // MUTATED
    const actionsData = {
      action: new Set(),
      bonus: new Set(),
      reaction: new Set(),
      special: new Set(),
    };

    try {
      // digest all weapons equipped populate the actionsData appropriate categories
      const weapons = sheetData?.inventory.find(({ label }) => label.includes('Weapon'))?.items; // brittle?

      const equippedWeapons = weapons.filter(({ data }) => data.equipped) || [];

      // MUTATES actionsData
      equippedWeapons.forEach((item) => {
        const attackBonus = item.data?.attackBonus;
        // FIXME this has to be set by the user, perhaps we can infer from the `actor.traits.weaponProf`
        const prof = item.data?.proficient ? sheetData.data.attributes.prof : 0;

        const actionType = item.data?.actionType;
        const actionTypeBonus = Number(sheetData.data.bonuses?.[actionType]?.attack || 0);

        const relevantAbility = getWeaponRelevantAbility(item.data, sheetData.data);
        const relevantAbilityMod = sheetData.data.abilities[relevantAbility]?.mod;

        const toHit = actionTypeBonus + relevantAbilityMod + attackBonus + prof;

        const activationType = getActivationType(item.data?.activation?.type);

        actionsData[activationType].add({
          ...item,
          labels: {
            ...item.labels,
            toHit: String(toHit),
          },
        });
      });

      // Setting - Show icon on inventory list
      if (game.settings.get(MODULE_ID, SPELL_BETTER.showIconsOnInventoryList)) {
        sheetData.settingsShowInventoryIcons = true;
      } else {
        sheetData.settingsShowInventoryIcons = false;
      }
    } catch (e) {
      log(true, 'error trying to digest inventory', e);
    }

    try {
      // digest all prepared spells and populate the actionsData appropriate categories
      // MUTATES actionsData
      sheetData?.spellbook.forEach(({ spells, label }, iLevel) => {
        //Spell Better 0.5.0 For Spellbook tab:  Add "pop-up" buttons next to each spell for To Hit and Damage 
        // adding info that damage and attacks are possible; h/t to module favtab
        //(NOte this has overlap with the below calculations but those are just for the front-page Actions section)
        for (const [iSpell, spell] of spells.entries()) {
            if (hasAttack(spell)) {
                sheetData.spellbook[iLevel].spells[iSpell].hasAttack = true;
            }
            if (hasDamage(spell)) {
                sheetData.spellbook[iLevel].spells[iSpell].hasDamage = true;
            }
        }//end for spells in each level


        // if the user only wants cantrips here, no nothing if the label does not include "Cantrip"
        if (game.settings.get(MODULE_ID, SPELL_BETTER.limitActionsToCantrips)) {
          // brittle
          if (!label.includes('Cantrip')) {
            return;
          }
        }

        const preparedSpells = spells.filter(({ data }) => {
          if (data?.preparation?.mode === 'always') {
            return true;
          }
          return data?.preparation?.prepared;
        });

        const reactions = preparedSpells.filter(({ data }) => {
          return data?.activation?.type === 'reaction';
        });

        const damageDealers = preparedSpells.filter(({ data }) => {
          //ASSUMPTION: If the spell causes damage, it will have damageParts
          return data?.damage?.parts?.length > 0;
        });

        new Set([...damageDealers, ...reactions]).forEach((spell) => {
          const actionType = spell.data?.actionType;

          const actionTypeBonus = String(sheetData.data.bonuses?.[actionType]?.attack || 0);
          const spellcastingMod = sheetData.data.abilities[sheetData.data.attributes.spellcasting]?.mod;
          const prof = sheetData.data.attributes.prof;

          const toHitLabel = String(Number(actionTypeBonus) + spellcastingMod + prof);

          const activationType = getActivationType(spell.data?.activation?.type);

          actionsData[activationType].add({
            ...spell,
            labels: {
              ...spell.labels,
              toHit: toHitLabel,
            },
          });
        });
      });
    } catch (e) {
      log(true, 'error trying to digest spellbook', e);
    }

    sheetData.actionsData = actionsData;

    // replace classLabels with Subclass + Class list
    try {
      let items = sheetData.items;
      const classList = items
        .filter((item) => item.type === 'class')
        .map((item) => {
          return `${item.data.subclass} ${item.name} ${item.data.levels}`;
        });

      sheetData.classLabels = classList.join(', ');
    } catch (e) {
      log(true, 'error trying to parse class list', e);
    }

    // add abbreviated spell activation labels
    try {
      // MUTATES sheetData
      sheetData?.spellbook.forEach(({ spells }) => {
        spells.forEach((spell) => {
          const newActivationLabel = spell.labels.activation
            .split(' ')
            .map((string, index) => {
              // ASSUMPTION: First "part" of the split string is the number
              if (index === 0) {
                return string;
              }
              // ASSUMPTION: Everything after that we can safely abbreviate to be just the first character
              return string.substr(0, 1);
            })
            .join(' ');

          spell.labels.activationAbbrev = newActivationLabel;
        });
      });
    } catch (e) {
      log(true, 'error trying to modify activation labels', e);
    }

    // add abbreviated feature activation labels
    try {
      let activeFeaturesIndex = sheetData.features.findIndex(({ label }) => label.includes('Active'));

      // MUTATES sheetData
      sheetData.features[activeFeaturesIndex].items.forEach((item) => {
        const newActivationLabel = item.labels.activation
          .split(' ')
          .map((string, index) => {
            // ASSUMPTION: First "part" of the split string is the number
            if (index === 0) {
              return string;
            }
            // ASSUMPTION: Everything after that we can safely abbreviate to be just the first character
            return string.substr(0, 1);
          })
          .join(' ');

        item.labels.activationAbbrev = newActivationLabel;
      });
    } catch (e) {
      log(true, 'error trying to modify activation labels', e);
    }

    // if description is populated and appearance isn't use description as appearance
    try {
      log(false, sheetData);
      if (!!sheetData.data.details.description?.value && !sheetData.data.details.appearance) {
        sheetData.data.details.appearance = sheetData.data.details.description.value;
      }
    } catch (e) {
      log(true, 'error trying to migrate description to appearance', e);
    }

    //0.5.1: Now that spells have been appropriately filtered and munged, add categories
    //0.5.3j: Now an array of {key, value}
    sheetData.categories = this.inventoryPlusForSpells.categorizeSpells(sheetData?.spellbook);
    sheetData.filtersIsCollapsed = this.actor.filtersIsCollapsed ?? false;

    return sheetData;
  }



}


export class SpellBetterPlugin extends SpellBetterCharacterSheet {
    constructor(actor, options) {
        super(actor, options)

        game.users.apps.push(this);
    }

    /** @override */
    //Create a different id for this sheet - otherwise it replaces the underlying sheet
    get id() {
        const id = `${MODULE_ID}-${this.actor.id}`;
        return id;
    }
    
    get template() {
        return `modules/${MODULE_ID}/templates/spellbook-sheet-holder.hbs`;
    }


    static addSBSheet(app, html, data) {
        if (!app.actor) return;
        //Create or reference the parallel SpellBetter sheet
        if (!app.actor.sbSheet) {
            app.actor.sbSheet = new SpellBetterPlugin(app.actor);
        }

        //Substitute the SpellBetter spellbook for the standard tab
        const spellbookTab = html.find('.tabs[data-group="primary"]').find('a[data-tab="spellbook"]');
        if (spellbookTab.length > 0) {
            spellbookTab.click(ev => {
                app.actor.sbSheet.render(true);
            });
        }
    }
}


/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once('init', async function () {
  log(true, `Initializing ${MODULE_ID}`);

  // Register custom module settings
  registerSettings();

  // Preload Handlebars templates
  await preloadTemplates();
});

/* ------------------------------------ */
/* Setup module							*/
/* ------------------------------------ */
// Hooks.once('setup', function () {
//   // Do anything after initialization but before
//   // ready
// });

//FIXME: Register SpellBetter Sheet - not a real solution, since we will want to pop up Spell Better independent of the Actor Sheet
Actors.registerSheet('dnd5e', SpellBetterCharacterSheet, {
  label: 'Spell Better Sheet',
  types: ['character'],
  makeDefault: false,
});

/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
// Hooks.once('ready', function () {
// });

//Replace the normal Spellbook tab with opening this sheet as a pop-up
Hooks.on(`renderActorSheet`, (app, html, data) => {
    //Don't do recursive creation of SBSheet
    if (!(app instanceof SpellBetterCharacterSheet) && game.settings.get(MODULE_ID, SPELL_BETTER.substituteForSpellbook)) {
        SpellBetterPlugin.addSBSheet(app, html, data);
    }
});