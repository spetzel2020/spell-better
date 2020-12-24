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
                dataset: {type: "spell", level: 0, preparation : {mode: "prepared"}},
                order: 0, prop: "spell0", slots: "&infin;", uses: "&infin;", usesSlots: false, type: "spell",  collapsed: false },
        spell1: { label: "SPELL_BETTER.SpellLevel1", canCreate: true, canPrepare: true, 
                dataset: {type: "spell", level: 1, preparation : {mode: "prepared"}},
                order: 10, prop: "spell1", slots: "4", uses: "4", usesSlots: true, type: "spell",  collapsed: false },     
        spell2: { label: "SPELL_BETTER.SpellLevel2", canCreate: true, canPrepare: true, 
                dataset: {type: "spell", level: 2, preparation : {mode: "prepared"}},
                order: 20, prop: "spell2", slots: "3", uses: "3", usesSlots: true, type: "spell",  collapsed: false },
        spell3: { label: "SPELL_BETTER.SpellLevel3", canCreate: true, canPrepare: true, 
                dataset: {type: "spell", level: 3, preparation : {mode: "prepared"}},
                order: 30, prop: "spell3", slots: "3", uses: "3", usesSlots: true, type: "spell",  collapsed: false },
        spell4: { label: "SPELL_BETTER.SpellLevel4", canCreate: true, canPrepare: true, 
                dataset: {type: "spell", level: 4, preparation : {mode: "prepared"}},
                order: 40, prop: "spell4", slots: "0", uses: "0", usesSlots: true, type: "spell",  collapsed: false },
        spell5: { label: "SPELL_BETTER.SpellLevel5", canCreate: true, canPrepare: true, 
                dataset: {type: "spell", level: 5, preparation : {mode: "prepared"}},
                order: 50, prop: "spell5", slots: "0", uses: "0", usesSlots: true, type: "spell",  collapsed: false },
        spell6: { label: "SPELL_BETTER.SpellLevel6", canCreate: true, canPrepare: true, 
                dataset: {type: "spell", level: 6, preparation : {mode: "prepared"}},
                order: 60, prop: "spell6", slots: "0", uses: "0", usesSlots: true, type: "spell",  collapsed: false },
        spell7: { label: "SPELL_BETTER.SpellLevel7", canCreate: true, canPrepare: true, 
                dataset: {type: "spell", level: 7, preparation : {mode: "prepared"}},
                order: 70, prop: "spell7", slots: "0", uses: "0", usesSlots: true, type: "spell",  collapsed: false },
        spell8: { label: "SPELL_BETTER.SpellLevel8", canCreate: true, canPrepare: true, 
                dataset: {type: "spell", level: 8, preparation : {mode: "prepared"}},
                order: 80, prop: "spell8", slots: "0", uses: "0", usesSlots: true, type: "spell",  collapsed: false },  
        spell9: { label: "SPELL_BETTER.SpellLevel9", canCreate: true, canPrepare: true, 
                dataset: {type: "spell", level: 9, preparation : {mode: "prepared"}},
                order: 90, prop: "spell8", slots: "0", uses: "0", usesSlots: true, type: "spell",  collapsed: false },                                                                                                                                          
        wanted: { label: "SPELL_BETTER.Category.Wanted",canCreate: true, canPrepare: true, 
                dataset: {type: "spell", level: 0, preparation : {mode: "prepared"}},
                order: 1000, prop: "spell1", slots: "&infin;", uses: "0", usesSlots: false, type: "wanted",  collapsed: true }
    }
}
