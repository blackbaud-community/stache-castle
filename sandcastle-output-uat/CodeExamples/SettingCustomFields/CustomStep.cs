[When(@"I add constituent")]
public void WhenIAddConstituent(Table constituents)
{
    foreach (var constituent in constituents.Rows)
    {
        BBCRMHomePage.OpenConstituentsFA();
        constituent["Last name"] += uniqueStamp;
        ConstituentsFunctionalArea.AddAnIndividual(groupCaption: "Add Records");
        CustomIndividualDialog.SetIndividualFields(constituent);
        IndividualDialog.Save();
    }
}