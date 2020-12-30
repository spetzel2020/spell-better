/*
29-Dec-2020 0.5.1:  Add isCustom flag to added categories



*/


export const MODULE_ID = 'spell-better';
export const MODULE_VERSION = "0.5.1";

//SPell Better 0.5.0: The filter lists have to be spelled out to match what is in the internal labels
export const SPELL_BETTER = {
    limitActionsToCantrips : 'limit-actions-to-cantrips',
    showIconsOnInventoryList : 'show-icons-on-inventory-list',
    expandedLimited : 'expanded-limited',
    labelFilterSets :  {
        castingTimes : [
            {filter : "1 Action", name: "DND5E.Action"},         
            {filter : "1 Bonus Action", name: "DND5E.BonusAction"},      
            {filter : "1 Reaction", name: "DND5E.Reaction"},                      
            {filter: "1 M", name: "SPELL_BETTER._1Minute"},
            {filter: "10 M",name: "SPELL_BETTER._10Minutes"},
            {filter: "1 H", name: "SPELL_BETTER._1Hour"}
        ],
        otherConcentration : [{filter: "concentration",name: "DND5E.Concentration"}],
        otherRitual : [{filter: "ritual",name: "DND5E.Ritual"}],
        otherPrepared : [{filter: "prepared",name: "DND5E.Prepared"}],                
        durations : [
            {filter : "Instantaneous", name: "DND5E.TimeInst"},                         
            {filter: "1 Rounds",name: "SPELL_BETTER._1Round"},
            {filter: "1 Minutes", name: "SPELL_BETTER._1Minute"},
            {filter: "10 Minutes",name: "SPELL_BETTER._10Minutes"},
            {filter: "1 Hours", name: "SPELL_BETTER._1Hour"}
        ],
        schools : [
            {filter: "Abjuration", name: "DND5E.SchoolAbj"},
            {filter: "Conjuration", name: "DND5E.SchoolCon"},
            {filter: "Divination", name: "DND5E.SchoolDiv"},
            {filter: "Enchantment", name: "DND5E.SchoolEnc"},
            {filter: "Evocation", name: "DND5E.SchoolEvo"},
            {filter: "Illusion", name: "DND5E.SchoolIll"},
            {filter: "Necromancy", name: "DND5E.SchoolNec"},
            {filter: "Transmutation", name: "DND5E.SchoolTrs"}
        ],
        levels : [
            {filter: "Cantrip", name: "DND5E.SpellLevel0"},
            {filter: "1st Level", name: "SPELL_BETTER.SpellLevel1"},
            {filter: "2nd Level", name: "SPELL_BETTER.SpellLevel2"},
            {filter: "3rd Level", name: "SPELL_BETTER.SpellLevel3"},
            {filter: "4th Level", name: "SPELL_BETTER.SpellLevel4"},
            {filter: "5th Level", name: "SPELL_BETTER.SpellLevel5"},
            {filter: "6th Level", name: "SPELL_BETTER.SpellLevel6"},
            {filter: "7th Level", name: "SPELL_BETTER.SpellLevel7"},
            {filter: "8th Level", name: "SPELL_BETTER.SpellLevel8"},
            {filter: "9th Level",  name: "SPELL_BETTER.SpellLevel9"}
        ]
    },
    categoriesVersion_key : "categoriesVersion",
    categoriesVersion : MODULE_VERSION, 
    categories_key : "categories",
    standardCategories : { 
        //.prop is needed for now for display     
        spell0: { label: "DND5E.SpellLevel0",
                templateItemData: {level: 0},
                filterSets: [
                    {filterSet : "levels", filters: ["Cantrip"]},
                    {filterSet : "category", filters: []}
                ],
                /* Will be overridden by actual spell level stats */
                prop: "spell0", canCreate: true, canPrepare: false, slots: "&infin;", uses: "&infin;", usesSlots: false,
                order: 0, type: "spell",  isCollapsed: true },
        spell1: { label: "SPELL_BETTER.SpellLevel1", 
                templateItemData: {level: 1},
                filterSets: [
                    {filterSet : "levels", filters: ["1st Level"]},
                    {filterSet : "category", filters: []}
                ],        
                prop: "spell1", canCreate: true, canPrepare: true, slots: "4", uses: "4", usesSlots: true,    
                order: 10, type: "spell",  isCollapsed: false },     
        spell2: { label: "SPELL_BETTER.SpellLevel2", 
                templateItemData: {level: 2},
                filterSets: [
                    {filterSet : "levels", filters: ["2nd Level"]},
                    {filterSet : "category", filters: []}
                ],             
                prop: "spell2", canCreate: true, canPrepare: true, slots: "3", uses: "3", usesSlots: true,       
                order: 20, type: "spell",  isCollapsed: false },
        spell3: { label: "SPELL_BETTER.SpellLevel3", 
                templateItemData: {level: 3},
                filterSets: [
                    {filterSet : "levels", filters: ["3rd Level"]},
                    {filterSet : "category", filters: []}
                ],  
                prop: "spell3", canCreate: true, canPrepare: true, slots: "3", uses: "3", usesSlots: true,                
                order: 30,  type: "spell",  isCollapsed: false },
        spell4: { label: "SPELL_BETTER.SpellLevel4", 
                templateItemData: {level: 4},
                filterSets: [
                    {filterSet : "levels", filters: ["4th Level"]},
                    {filterSet : "category", filters: []}
                ],      
                prop: "spell4", canCreate: true, canPrepare: true, slots: "3", uses: "3", usesSlots: true,                
                order: 40,  type: "spell",  isCollapsed: false },          
        spell5: { label: "SPELL_BETTER.SpellLevel5", 
                templateItemData: {level: 5},
                filterSets: [
                    {filterSet : "levels", filters: ["5th Level"]},
                    {filterSet : "category", filters: []}
                ],                
                prop: "spell5", canCreate: true, canPrepare: true, slots: "3", uses: "3", usesSlots: true,                
                order: 50,  type: "spell",  isCollapsed: false },
        spell6: { label: "SPELL_BETTER.SpellLevel6",
                templateItemData: {level: 6},
                filterSets: [
                    {filterSet : "levels", filters: ["6th Level"]},
                    {filterSet : "category", filters: []}
                ],                
                prop: "spell6", canCreate: true, canPrepare: true, slots: "1", uses: "1", usesSlots: true,                
                order: 60,  type: "spell",  isCollapsed: false },
        spell7: { label: "SPELL_BETTER.SpellLevel7", 
                templateItemData: {level: 7},
                filterSets: [
                    {filterSet : "levels", filters: ["7th Level"]},
                    {filterSet : "category", filters: []}
                ],                
                prop: "spell7", canCreate: true, canPrepare: true, slots: "1", uses: "1", usesSlots: true,                
                order: 70,  type: "spell",  isCollapsed: false },
        spell8: { label: "SPELL_BETTER.SpellLevel8", 
                templateItemData: {level: 8},
                filterSets: [
                    {filterSet : "levels", filters: ["8th Level"]},
                    {filterSet : "category", filters: []}
                ],                
                prop: "spell8", canCreate: true, canPrepare: true, slots: "1", uses: "1", usesSlots: true,                
                order: 80,  type: "spell",  isCollapsed: false },
        spell9: { label: "SPELL_BETTER.SpellLevel9", 
                templateItemData: {level: 9},
                filterSets: [
                    {filterSet : "levels", filters: ["9th Level"]},
                    {filterSet : "category", filters: []}
                ],                
                prop: "spell9", canCreate: true, canPrepare: true, slots: "1", uses: "1", usesSlots: true,                
                order: 90,  type: "spell",  isCollapsed: false },
        wanted4: { label: "Wanted (4th)",
                templateItemData: {level: 9}, templateFlags: {"category": "wanted"},
                filterSets: [
                    {filterSet : "levels", filters: ["4th Level"]},
                    {filterSet : "category", filters: ["wanted"]}
                ],     
                canCreate: true, canPrepare : true,           
                order: 999, usesSlots: false, type: "spell",  isCollapsed: true },                                                                                                                                                       
        wanted: { label: "SPELL_BETTER.Category.Wanted",
                templateItemData: {level: 9}, templateFlags: {"category": "wanted"},
                filterSets: [
                    {filterSet : "category", filters: ["wanted"]}
                ],     
                canCreate: true, canPrepare : true,           
                order: 1000, usesSlots: false, type: "spell",  isCollapsed: true },
        //ALL category to make sure setting a flag doesn't hide a spell completely                
        all:    {label: "SPELL_BETTER.Category.All", 
                templateItemData: {level: 9},
                filterSets: [],      
                canCreate: true, canPrepare : true,                     
                order: 9000, usesSlots: false, type: "spell",  isCollapsed: true }
    }
}
