public new static void SetHouseholdFields(TableRow fields)
{
    OpenTab("Household");
    if (fields.ContainsKey("Related individual"))
    {
        WaitClick(getXInputNewFormTrigger(getXInput(GetDialogId(DialogIds), "_SPOUSEID_value")));
    }
}