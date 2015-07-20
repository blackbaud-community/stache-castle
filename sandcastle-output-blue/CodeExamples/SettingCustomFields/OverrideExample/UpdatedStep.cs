[When(@"set the household fields")]
public void WhenSetTheHouseholdFields(Table fieldsTable)
{
    foreach (var fieldValues in fieldsTable.Rows)
    {
        CustomIndividualDialog.SetHouseholdFields(fieldValues);
    }
}