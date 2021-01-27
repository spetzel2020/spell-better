# BUGS
>>> 0.7.5b If you add a spell to a Custom View and then delete the View, the Spell may disappear
    - test that when a Category is changed, the spells are correctly migrated
    - probably needs a warning
    - From Filter -> View nothing, from View -> Filter just remove the category from the spells
0.8.0: Not actually removing the flags from the spells (need to use the -= form)  
0.8.0: Order of spells in Filter and View will always match (because order is stored on the spell)
    - Could store order along with the list - woudl actually make sorting easier
0.8.0: May be fixed: A spell cannot be in multiple Views

# REFACTORING
- Instead of hijacking the onDrop, we could store the displayedCategory on every item in a View or Spellbook
    - (would only be for display and not in the actual item)
- Category.js: Should encapsulate existing Category better
    - reference this.object
- Remove +Spell on every standard filter - just have in one place (top of the sheet, maybe with the "pick from available spells")
- Performance poor in areas
>>> Merge any changes to the OGL sheet
- Profile
- Look for recalculations like getHighest/LowestSortFlag()
- Save just a single changed category(if it would help)

# FEATURES
- Move the Print features into a separate Class
    - Try the method mentioned below
    - Can the spell icons be printed, or is that a media print setting
- One button creation of Custom Filter using whatever filters are selected
    - Or Filter selection should be multi-select: use tag display like on main page?
>>> Check whether/how well SB works for Druids and Clerics (full casters)
    - can look up what the rules are
- Automatically populate all available Wizard spells into a temporary compendium for selection, by level

- README.md:  Need examples of how to use:
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
0.7.4: Displays Innate spells correctly, including related bug with showing number of uses/slots
0.7.4: If you're using InventoryPlus, getData() spins because of a failure on sheetdata.inventory.find (which is no longer an array)
    - fixed by adding an Array.from() which will convert the object or leave the array in place
0.7.4: (#13) If a category is hidden (because of the setting to not show categories with 0 spells) it will still get considered for the Move Up/Down flags
    - Sometimes the second-to-top category cannot be moved up   
0.7.4: The new sortCategories() call in categorizeSpells() is sending the sheet into a terrible render loop
    - Need to hide categories with no spells (if desired) using a flag (show/hide in addition is isCollapsed)
    - and in addition when move up/down, have to skip categories that are hidden     
0.7.5: Changes to standard, custom categories are not sticking (change Ritual or delete Wanted)    
0.7.5 Don't show the Filters field unless you specify a type of Filter
    - "Create a saved Filter that shows all View or non-Spellbook spells"
0.7.5 - What's the difference between a MyRitual View and the standard one?
0.8.0: Can no longer delete or rename standard categories

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
0.7.5 Change +Add to +Spell 
0.7.5 New Category Dialog:
        - Choose View, Filter, or Spellbook, with appropriate explanations
        - A Filter you just Preset some filter combination
        - a View you drag in specific Spells in as a different View on your Known Spells
        - A Spellbook is a separate list of spells, not duplicating your Known list (like **Wanted** or **The Brown Spellbook**)
0.8.0 Switch to recording the spells in the category so there are not lingering problems
    - Migrates old spells (removes flags and records them in the category)

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