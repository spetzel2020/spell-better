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
        levels : ["1st Level","2nd Level","3rd Level","4th Level","5th Level","6th Level","7th Level","8th Level","9th Level"]
    }
}
