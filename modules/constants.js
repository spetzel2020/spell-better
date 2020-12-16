export const MODULE_ID = 'spell-better';

//SPell Better 0.5.0: The filter lists have to be spelled out to match what is in the internal labels
export const SPELL_BETTER = {
    limitActionsToCantrips : 'limit-actions-to-cantrips',
    showIconsOnInventoryList : 'show-icons-on-inventory-list',
    expandedLimited : 'expanded-limited',
    filters :  {
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
    }
}
