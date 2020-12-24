export const MODULE_ID = 'spell-better';

//SPell Better 0.5.0: The filter lists have to be spelled out to match what is in the internal labels
export const SPELL_BETTER = {
    limitActionsToCantrips : 'limit-actions-to-cantrips',
    showIconsOnInventoryList : 'show-icons-on-inventory-list',
    expandedLimited : 'expanded-limited',
    filters :  {
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
    standardCategories : { 
        spell0: { label: "DND5E.SpellLevel0", canCreate: true, canPrepare: false, 
                dataset: {type: "spell", level: 0},
                filterSets: [
                    {filterSet : "levels", filter: "Cantrip"}
                ],
                order: 0, prop: "spell0", slots: "&infin;", uses: "&infin;", usesSlots: false, type: "spell",  isCollapsed: true },
        spell1: { label: "SPELL_BETTER.SpellLevel1", canCreate: true, canPrepare: true, 
                dataset: {type: "spell", level: 1},
                filterSets: [
                    {filterSet : "levels", filter: "1st Level"}
                ],
                order: 10, prop: "spell1", slots: "4", uses: "4", usesSlots: true, type: "spell",  isCollapsed: false },     
        spell2: { label: "SPELL_BETTER.SpellLevel2", canCreate: true, canPrepare: true, 
                dataset: {type: "spell", level: 2},
                filterSets: [
                    {filterSet : "levels", filter: "2nd Level"}
                ],                
                order: 20, prop: "spell2", slots: "3", uses: "3", usesSlots: true, type: "spell",  isCollapsed: false },
        spell3: { label: "SPELL_BETTER.SpellLevel3", canCreate: true, canPrepare: true, 
                dataset: {type: "spell", level: 3},
                filterSets: [
                    {filterSet : "levels", filter: "3rd Level"}
                ],                
                order: 30, prop: "spell3", slots: "3", uses: "3", usesSlots: true, type: "spell",  isCollapsed: false },
        spell4: { label: "SPELL_BETTER.SpellLevel4", canCreate: true, canPrepare: true, 
                dataset: {type: "spell", level: 4},
                filterSets: [
                    {filterSet : "levels", filter: "4th Level"}
                ],                
                order: 40, prop: "spell4", slots: "0", uses: "0", usesSlots: true, type: "spell",  isCollapsed: false },
        spell5: { label: "SPELL_BETTER.SpellLevel5", canCreate: true, canPrepare: true, 
                dataset: {type: "spell", level: 5},
                filterSets: [
                    {filterSet : "levels", filter: "5th Level"}
                ],                
                order: 50, prop: "spell5", slots: "0", uses: "0", usesSlots: true, type: "spell",  isCollapsed: false },
        spell6: { label: "SPELL_BETTER.SpellLevel6", canCreate: true, canPrepare: true, 
                dataset: {type: "spell", level: 6},
                filterSets: [
                    {filterSet : "levels", filter: "6th Level"}
                ],                
                order: 60, prop: "spell6", slots: "0", uses: "0", usesSlots: true, type: "spell",  isCollapsed: false },
        spell7: { label: "SPELL_BETTER.SpellLevel7", canCreate: true, canPrepare: true, 
                dataset: {type: "spell", level: 7},
                filterSets: [
                    {filterSet : "levels", filter: "7th Level"}
                ],                
                order: 70, prop: "spell7", slots: "0", uses: "0", usesSlots: true, type: "spell",  isCollapsed: false },
        spell8: { label: "SPELL_BETTER.SpellLevel8", canCreate: true, canPrepare: true, 
                dataset: {type: "spell", level: 8},
                filterSets: [
                    {filterSet : "levels", filter: "8th Level"}
                ],                
                order: 80, prop: "spell8", slots: "0", uses: "0", usesSlots: true, type: "spell",  isCollapsed: false },  
        spell9: { label: "SPELL_BETTER.SpellLevel9", canCreate: true, canPrepare: true, 
                dataset: {type: "spell", level: 9},
                filterSets: [
                    {filterSet : "levels", filter: "9th Level"}
                ],                
                order: 90, prop: "spell8", slots: "0", uses: "0", usesSlots: true, type: "spell",  isCollapsed: false },                                                                                                                                          
        wanted: { label: "SPELL_BETTER.Category.Wanted",canCreate: true, canPrepare: true, 
                dataset: {type: "spell", level: 0},
                filterSets: [
                    {filterSet : "custom", filter: "wanted"}
                ],                
                order: 1000, prop: "spell1", slots: "&infin;", uses: "&infin;", usesSlots: false, type: "spell",  isCollapsed: true }
    }
}
