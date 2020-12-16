export const MODULE_ID = 'spell-better';

//SPell Better 0.5.0: The filter lists have to be spelled out to match what is in the internal labels
export const SPELL_BETTER = {
    limitActionsToCantrips : 'limit-actions-to-cantrips',
    showIconsOnInventoryList : 'show-icons-on-inventory-list',
    expandedLimited : 'expanded-limited',
    filters :  {
        durations : [
            {filter : "Instantaneous", label: "DND5E.TimeInst"},                         
            {filter: "1 Rounds",label: "SPELL_BETTER._1Round"},
            {filter: "1 Minutes", label: "SPELL_BETTER._1Minute"},
            {filter: "10 Minutes",label: "SPELL_BETTER._10Minutes"},
            {filter: "1 Hours", label: "SPELL_BETTER._1Hour"}
        ],
        schools : [
            {filter: "Abjuration", label: "DND5E.SchoolAbj"},
            {filter: "Conjuration", label: "DND5E.SchoolCon"},
            {filter: "Divination", label: "DND5E.SchoolDiv"},
            {filter: "Enchantment", label: "DND5E.SchoolEnc"},
            {filter: "Evocation", label: "DND5E.SchoolEvo"},
            {filter: "Illusion", label: "DND5E.SchoolIll"},
            {filter: "Necromancy", label: "DND5E.SchoolNec"},
            {filter: "Transmutation", label: "DND5E.SchoolTrs"}
        ],
        levels : [
            {filter: "Cantrip", label: "DND5E.SpellLevel0"},
            {filter: "1st Level", label: "SPELL_BETTER.SpellLevel1"},
            {filter: "2nd Level", label: "SPELL_BETTER.SpellLevel2"},
            {filter: "3rd Level", label: "SPELL_BETTER.SpellLevel3"},
            {filter: "4th Level", label: "SPELL_BETTER.SpellLevel4"},
            {filter: "5th Level", label: "SPELL_BETTER.SpellLevel5"},
            {filter: "6th Level", label: "SPELL_BETTER.SpellLevel6"},
            {filter: "7th Level", label: "SPELL_BETTER.SpellLevel7"},
            {filter: "8th Level", label: "SPELL_BETTER.SpellLevel8"},
            {filter: "9th Level",  label: "SPELL_BETTER.SpellLevel9"}
        ]
    }
}
