# BUGS
- Don't show the Filters field unless you specify a type of Filter
    - "Create a saved Filter that shows all View or non-Spellbook spells"


# REFACTORING
>>> Look at Issues on GitHub page`
>>> Merge any changes to the OGL sheet
- Profile
- Look for recalculations like getHighest/LowestSortFlag()
- Save just a single changed category(if it would help)

# FEATURES
- Move the Print features into a separate Class
    - Try the method mentioned below
    - Can the spell icons be printed, or is that a media print setting
- Allow creation of Custom Filter (just a way of saving presets)
>>> Check whether/how well SB works for Druids, Clerics, and Paladins
- Automatically populate all available Wizard spells into a temporary compendium for selection, by level

- New Category Dialog:
    - Choose either Filter or Spellbook, with appropriate explanations
    - A Filter you just Preset some filter combinations, or drag specific Spells in as a different View on your Known Spells
    - A Spellbook is a separate list of spells, possibly duplicating your Known spells (like Wanted or The Brown Spellbook)
    - Filter selection should be multi-select: use tag display like on main page?
- Need examples of how to use:
    - Wanted Spells: Create a custom category called Wanted, and check the Show Only in Category checkbox
    - Spells in a found Spellbook: Same. When you transfer it to your Spellbook, simply create a new version
    - Show all Rituals: Filter on Ritual

# FIXED BUGS
- The custom categories are remarkably persistent when when I think i've deleted them
- Can't drag-and-drop within the spell sheet
- Not saving the collapsed/shown status (because we are reloading each time)
FIXED? - Currently, Inventory+ is incompatible with the SpellSheet
    - Seems to be working
FIXED Clicking on  any part of a category header toggles collapsed/shown , even if you're editing spell slots
    - Only if you click on the toggle now
FIXED Spell slots should move to the top, or need to be not hard-coded by category
    - spell slots are copied to standard categories
FIXED - New Category dialog does't use the category checkbox yet (need to reword)
FIXED - Need Move Up/Down for custom categories
FIXED - Default should be that OTHER filters (even without a custom category) do not show one with a Custom Category
    - just like we have for the standard categories
FIXED Need Edit for custom catgeories
FIXED- Either remove Print in border, or get it working (does a PopOut and then a print)
    - will need to check that PopOut! is enabled
FIXED 0.5.3g When you first open the Spellbook, it dies with spells = null    
FIXED - New Categories get added at the end, even with the Order being -1 from All - need to sort immediately?
0.7.2: Inventory+ForSpells.js#initCategories(): Missing MODULE_VERSION 
0.7.3a: Need to sort when we first load categories 
0.7.3 Performance on show/hide a category is terrible
        - Converted to show/hide
0.7.3: The ordering is sometimes wonky and the move up/down don't work for the last and first item
0.7.3 Drag a spell from COmpenduim to a standard View -> doesn't show up

# COMPLETED FEATURES
0.5.1r:  Need to store version in the flags so that we know whether they need to be upgraded in place    
- Dialog to create a new category with filters and templates
0.5.2: Refactor the filter/view design to look like the constants without the extraneous filterSet: and filters:
0.5.2: - Make Rituals a standard Category
0.7.0 New Category Dialog:
    - Choose either View or Spellbook, with appropriate explanations
    - A View drag specific Spells in as a different View on your Known Spells
    - A Spellbook is a separate list of spells, possibly duplicating your Known spells (like Wanted or The Brown Spellbook)
0.7.3a: Use Spellbook from other Sheets should be a client setting so everbody has a choices   
0.7.3 Need to sort when we first load categories  

# PRINT SOLUTION (from @Sunspots)
Can't you use CSS only to exclude everything but the desired element? Add a class to the window you want to print and in the print css something like
body > *:not(.print) { display:none; } 
[12:54 AM] Sunspots: Since windows are direct descendants to the body.
[1:04 AM] Sunspots: @Spetzel Add the class print to the window you want to print, and inject this style element:

    $(document.body).append(`<style media="print">
    body > *:not(.print) { display:none !important; }
    .print { width: 100% !important; height: 100% !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; }
    </style>`)

You can of course add more CSS to descendants of .print to hide header etc.