Last tested with v0.8.0

# STANDARD CATEGORIES
1.  Innate, Cantrip...9th, Ritual, All			0.8.1
2. Can't change name of standard filters			0.8.1			


# NEW/EDIT/DELETE CATEGORY
1. Filter: Duplicate behavior of standard categories		0.8.0
2. View - populate using dragging 			0.8.0
3. Change Category type
	- Filter to View/Spellbook leaves no spells		0.8.0
	- View to Filter removes spells			0.8.0
	- Spellbook to VIew/Filter moves spells to Known	0.8.0
4.  Delete category - contained Spellbook spells should be left in overall?
    - Need a dialog saying what will happen
5. Can change name of standard Custom: Wanted		Fixed in 0.8.1

# ADD/MOVE SPELLS TO CATEGORY
1.  Drag spell from Compendium to:
    - Spellbook
    - Custom View
    - Standard View (Filter)
2. Drag spell within a category reorders				0.8.0
3. Drag spell from standard Filter to Spellbook deletes from Known	Works, but not persistent

# MOVE CATEGORY
1. Move category up	/down					0.8.0
2. Last category only has move-up				0.8.0
3. First category only has move-down				0.8.0
4. If some categories are hidden, move skips over the hidden categories	0.8.0
    
#  SETTINGS
1. Show/hide standard categories with no spells
2. Save collapsed/shown between sessions
3. Save new categories (and spells)				Saves names, but not Spellbook spells

BUGS
>>> 0.7.5b If you add a spell to a Custom View and then delete the View, the Spell may disappear
    - test that when a Category is changed, the spells are correctly migrated
    - probably needs a warning
    - From Filter -> View nothing, from View -> Filter just remove the category from the spells