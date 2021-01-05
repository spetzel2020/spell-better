# BUGS



# FEATURES
- Move the Print features into a separate Class
- New Category Dialog:
    - Choose either Filter or Spellbook, with appropriate explanations
    - A Filter you just Preset some filter combinations, or drag specific Spells in as a different View on your Known Spells
    - A Spellbook is a separate list of spells, possibly duplicating your Known spells (like Wanted or The Brown Spellbook)
    - Filter selection should be multi-select: use tag display like on main page?
- Need examples of how to use:
    - Wanted Spells: Create a custom category called Wanted, and check the Show Only in Category checkbox
    - Spells in a found Spellbook: Same. When you transfer it to your Spellbook, simply create a new version
    - Show all Rituals: Filter on Ritual
>>> Make a pluggable Spellbook


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
# COMPLETED FEATURES
0.5.1r:  Need to store version in the flags so that we know whether they need to be upgraded in place    
- Dialog to create a new category with filters and templates
0.5.2: Refactor the filter/view design to look like the constants without the extraneous filterSet: and filters:
0.5.2: - Make Rituals a standard Category
