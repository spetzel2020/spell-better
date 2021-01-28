Last tested with v0.8.0

# STANDARD CATEGORIES
1.  Innate, Cantrip...9th, Ritual, All			0.8.1
2. Can't change name of standard filters			0.8.1	
3. New Actor with new spellbook			Seems to pick up old categories					

# NEW/EDIT/DELETE CATEGORY
1. Filter: Duplicate behavior of standard categories		0.8.0
2. View - populate using dragging 			0.8.0
3. Change Category type
	- Filter to View/Spellbook leaves no spells		0.8.0
	- View to Filter removes spells			0.8.0
	- View to Spellbook				Removes from the source View but not others
	- Spellbook to View/Filter moves spells to Known	0.8.0
4.  Delete category - contained Spellbook spells should be left in overall?
    - Need a dialog saying what will happen
5. Can change name of standard Custom: Wanted		Fixed in 0.8.1

# ADD/MOVE SPELLS TO CATEGORY
1.  Drag spell from Compendium to:
    - Spellbook						0.8.2
    - Custom View						No - appears in the Filter
    - Standard View (Filter)					0.8.2
2. Drag spell within a category reorders				0.8.0
3. Drag spell from standard Filter to Spellbook deletes from Known	0.8.2

# MOVE CATEGORY
1. Move category up	/down					0.8.0
2. Last category only has move-up				0.8.0
3. First category only has move-down				0.8.0
4. If some categories are hidden, move skips over the hidden categories	0.8.0
    
#  SETTINGS
1. Show/hide standard categories with no spells			0.8.2
2. Save collapsed/shown between sessions
3. Save new categories (and spells)				Saves names, but not Spellbook spells

BUGS FIXED IN 0.8.2
 0.7.5b If you add a spell to a Custom View and then delete the View, the Spell may disappear
    - test that when a Category is changed, the spells are correctly migrated
    - probably needs a warning
    - From Filter -> View nothing, from View -> Filter just remove the category from the spells
0.8.0: Not actually removing the flags from the spells (need to use the -= form)  
0.8.0: Order of spells in Filter and View will always match (because order is stored on the spell)
    - Could store order along with the list - woudl actually make sorting easier
0.8.0: May be fixed: A spell cannot be in multiple Views