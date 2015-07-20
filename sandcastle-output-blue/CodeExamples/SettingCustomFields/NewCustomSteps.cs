[When(@"I start to add a constituent")]
public void WhenIStartToAddAConstituent(Table constituents)
{
    foreach (var constituent in constituents.Rows)
    {
        BBCRMHomePage.OpenConstituentsFA();
        constituent["Last name"] += uniqueStamp;
        ConstituentsFunctionalArea.AddAnIndividual(groupCaption: "Add Records");
        IndividualDialog.SetIndividualFields(constituent);
    }
}

[When(@"I set the custom constituent field ""(.*)"" to ""(.*)""")]
public void WhenISetTheCustomConstituentFieldTo(string fieldCaption, string value)
{
    CustomIndividualDialog.SetCustomField(fieldCaption, value);
}

[When(@"I save the add an individual dialog")]
public void WhenISaveTheAddAnIndividualDialog()
{
    IndividualDialog.Save();
}