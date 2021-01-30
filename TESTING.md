Last tested with v0.8.2

# STANDARD CATEGORIES
1.  Innate, Cantrip...9th, Ritual, All			0.8.2
2. Can't change name of standard filters			0.8.2	
3. New Actor with new spellbook			0.8.2					

# NEW/EDIT/DELETE CATEGORY
1. Filter: Duplicate behavior of standard categories		0.8.2
2. View - populate using dragging 			0.8.2
3. Change Category type
	- Filter to View/Spellbook leaves no spells		0.8.2
	- Filter -> View/Spellbook -> Filter has None	0.8.2 (None filter = All)
	- View to Filter removes spells			0.8.0
	- View to Spellbook				0.8.2 (removes from Filters)
	- Spellbook to View/Filter moves spells to Known	0.8.2
4.  Delete category - Spellbook spells go into Known		0.8.2
5. Can change name of standard Custom: Wanted		0.8.2

# ADD/MOVE SPELLS TO CATEGORY
1.  Drag spell from Compendium to:
    - Spellbook						0.8.2
    - Custom View						0.8.2
    - Standard View (Filter)					0.8.2
2. Drag spell within a category reorders				0.8.2
3. Drag spell from standard Filter to Spellbook deletes from Known	0.8.2

# MOVE CATEGORY
1. Move category up	/down					0.8.2
2. Last category only has move-up				0.8.2
3. First category only has move-down				0.8.2
4. If some categories are hidden, move skips over the hidden categories	0.8.2
    
#  SETTINGS
1. Show/hide standard categories with no spells			0.8.2
2. Save collapsed/shown between sessions			0.8.2
3. Save new categories (and spells)				0.8.2

# BUGS FIXED IN 0.8.3
- Can't use +Spell (Issue #15)                  0.8.3

# BUGS FIXED IN 0.8.2
- 0.7.5b If you add a spell to a Custom View and then delete the View, the Spell may disappear
    - test that when a Category is changed, the spells are correctly migrated
    - probably needs a warning
    - From Filter -> View nothing, from View -> Filter just remove the category from the spells
- 0.8.0: Not actually removing the flags from the spells (need to use the -= form)  
