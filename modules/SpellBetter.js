/*
10-Dec-2020     0.5.0: Forked from Calego/foundryVTT_5eOGL sheet
15-Dec-2020     0.5.0: Make filter sets ORs
16-Dec-2020     0.5.0: Add To Hit and Damage "pop-up" buttons to allow continued damage rerolls from sheet
                Override _filterItems so that spells get filtered here only
                Move abbreviated activation labels and setting of Ritual, Concentration, and Prepared labels fr filters
21-Dec-2020     0.5.0: Add a Print option to the header buttons  
22-Dec-2020     0.5.1: Incorporate a copied/mangled Inventory+  and implement its category and drag-and-drop tools        
23-Dec-2020     0.5.1c: Attach listeners to toggle category collapsed/shown - loop through    
*/

import { log, getActivationType, getWeaponRelevantAbility, hasAttack, hasDamage } from './helpers.js';
import { registerSettings } from './settings.js';
import { preloadTemplates } from './preloadTemplates.js';
import { MODULE_ID, SPELL_BETTER } from './constants.js';
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
        if (newSpell) {
            for (const [flagKey, flagValue] of Object.entries(templateFlags)) {
                await newSpell.setFlag(MODULE_ID,flagKey, flagValue);
            }
        }
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
                const bodyCopy = this.element[0].parentElement.cloneNode(true);//.find("article.spellbook");
                if (!bodyCopy) return;
                //Now remove all elements except this Actor sheet (but keep styles etc)
                const uuid = this.element[0].id;
                const actorCopy = $(bodyCopy).find("#"+uuid);
                SpellBetterCharacterSheet.removeAllChildrenExcept(bodyCopy, uuid);

                this.printContent(bodyCopy)
            }
        })

        return buttons;
    }

    static removeAllChildrenExcept(parent, exceptId) {
        //
        while (parent.childNodes.length > 1) {
            if (parent.firstChild.id !== exceptId) {
                parent.removeChild(parent.firstChild);
            }
        }
}

    async printContent(bodyCopy) {
        const printableContent = bodyCopy.outerHTML;
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
//FIXME: Should call Inventory+ForSPells for Dialog
    html.find(".custom-category").click(async ev => {
        let template = await renderTemplate('modules/spell-better/templates/categoryDialog.hbs', {});
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
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Cancel"
                }
            },
            default: "accept",
        });
        d.render(true);
    });

    //Attach listeners to toggle category collapsed/shown - loop through
    const categoryHeaders = html.find(".toggle-collapse");
    const inventoryPlusForSpells = this.inventoryPlusForSpells;
    for (const header of categoryHeaders) {
        const el = $(header);
        const category = el[0].dataset.category;

        el.click(async ev => {
            inventoryPlusForSpells.customCategories[category].isCollapsed = !inventoryPlusForSpells.customCategories[category].isCollapsed;
            inventoryPlusForSpells.saveCategories();
        });
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
    
    //This is purely for Handlebars to generate the right output
    sheetData.filters.choices = SPELL_BETTER.filters;

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
            const appliedFilters = filters.map(f => f.filter).filter(f => taggedFilters.includes(f));
            if (appliedFilters.length) {
                appliedFilterSets.push({filterSet, filters: appliedFilters});
            }
        }
        sheetData?.spellbook.forEach((sbi, index) => {
            //Not really InventoryPlus, but fits the filtering and categorization
            sheetData.spellbook[index].spells = InventoryPlusForSpells.filterSpells(sbi.spells, appliedFilterSets);
        
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
    if (!this.inventoryPlusForSpells) {
        this.inventoryPlusForSpells = new InventoryPlusForSpells(this.actor);
    }
    sheetData.spellbook = this.inventoryPlusForSpells.categorizeSpells(sheetData?.spellbook);

    return sheetData;
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
