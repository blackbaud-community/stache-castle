public new static void SetHouseholdFields(TableRow fields)
{
    OpenTab("Household");
    if (fields.ContainsKey("Related individual"))
    {
        WaitClick(getXInputNewFormTrigger(getXInput(GetDialogId(DialogIds), "_SPOUSEID_value")));
        SetTextField(getXInput("IndividualSpouseBusinessSpouseForm", "_SPOUSE_LASTNAME_value"), fields["Related individual"]);
        OK();
    }
}