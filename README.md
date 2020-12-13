# Spetzel's Spell Better Spellbook for Wizards and lesser prepared-spell casters

![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2FElfFriend-DnD%2Ffoundryvtt-5eOGLCharacterSheet%2Fmaster%2Fsrc%2Fmodule.json&label=Foundry%20Version&query=$.compatibleCoreVersion&colorB=orange)
[![ko-fi](https://img.shields.io/badge/-buy%20me%20a%20coffee-%23FF5E5B)](https://ko-fi.com/spetzel)

A freely-forked version of https://github.com/ElfFriend-DnD/foundryvtt-5eOGLCharacterSheet, itself "heavily inspired by the Official 5e Character Sheet and the Roll20 default 5e Sheet. This sheet is chaotic and packed with information all on one screen, but it does have the advantage of having some muscle memory if you're coming from either pen and paper or Roll20."

The focus of Spell Better is on a flexible spellbook sheet for Wizards, with:
- grouping, filtering, and sorting
- "saved" groups of spells (for example, traveling vs. dungeoneering, wanted vs. known)
- rituals
- clearer available spell slots

## Installation

Module JSON:

```
https://github.com/spetzel2020/spell-better/releases/download/latest/module.json
```

## Gallery


[<img src="readme-img/main-top.png" width="30%"></img>](readme-img/main-top.png)
[<img src="readme-img/main-bottom.png" width="30%"></img>](readme-img/main-bottom.png)
[<img src="readme-img/spellbook.png" width="30%"></img>](readme-img/spellbook.png)
[<img src="readme-img/biography.png" width="30%"></img>](readme-img/biography.png)

Click to view bigger.

## Key Features & Changes

### Actions Area
Dead center of the screen this is the place where all of the "combat-important" (damage-dealing) spells and items live. Option in settings to limit spells to only Cantrips.

### Foundry-style Spellbook
It's not as familiar for a Roll20 user, but believe me when I say it's improved in almost every way.

## Options

| **Name**                      | Description                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Limit Actions to Cantrips** | Instead of showing all spells that deal damage in the Actions panel, limit it to only cantrips.         |
| **Add Icons to Inventory**    | Adds icons to all items in the inventory section, might make itemes with limited charges display oddly. |

This sheet respects the 5e System setting: "Disable Experience Tracking"

### Compatibility

See Compatibility for https://github.com/ElfFriend-DnD/foundryvtt-5eOGLCharacterSheet

## Acknowledgements

Forked from https://github.com/ElfFriend-DnD/foundryvtt-5eOGLCharacterSheet . Their Acknowledgements included below:

Obviously almost all of the layout decisions here are pretty directly ripped from the Roll20 OGL Character Sheet, and by proxy the WOTC official 5e Sheet.

Shares a lot of code with my own [Compact DnDBeyond-like 5e Character Sheet](https://github.com/ElfFriend-DnD/foundryvtt-compactBeyond5eSheet). If you like D&D Beyond's layout but want it more compact and foundry-fied, check it out.

Yoinked some expanded Biography tab code directly from [tidy5e-sheet](https://github.com/sdenec/tidy5e-sheet). Also took their localization of the headers in said tab.

Bootstrapped with Nick East's [create-foundry-project](https://gitlab.com/foundry-projects/foundry-pc/create-foundry-project).

Mad props to the [League of Extraordinary FoundryVTT Developers](https://forums.forge-vtt.com/c/package-development/11) community which helped me figure out a lot.
