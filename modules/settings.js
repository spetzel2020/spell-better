import { MySettings, MODULE_ID } from './constants.js';

export const registerSettings = function () {
  CONFIG[MODULE_ID] = { debug: false };

  // Register any custom module settings here
  game.settings.register(MODULE_ID, SPELL_BETTER.limitActionsToCantrips, {
    name: 'SPELL_BETTER.limitActionsToCantrips',
    default: false,
    type: Boolean,
    scope: 'client',
    config: true,
    hint: 'SPELL_BETTER.limitActionsToCantripsHint',
  });

  game.settings.register(MODULE_ID, SPELL_BETTER.showIconsOnInventoryList, {
    name: 'SPELL_BETTER.showIconsOnInventoryList',
    default: false,
    type: Boolean,
    scope: 'client',
    config: true,
    hint: 'SPELL_BETTER.showIconsOnInventoryListHint',
  });

  game.settings.register(MODULE_ID, SPELL_BETTER.expandedLimited, {
    name: 'SPELL_BETTER.expandedLimited',
    default: false,
    type: Boolean,
    scope: 'world',
    config: true,
    hint: 'SPELL_BETTER.expandedLimitedHint',
  });
};
