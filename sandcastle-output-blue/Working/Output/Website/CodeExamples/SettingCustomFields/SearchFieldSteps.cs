[When(@"I open the constituent search dialog")]
public void WhenIOpenTheConstituentSearchDialog()
{
    BBCRMHomePage.OpenConstituentsFA();
    FunctionalArea.OpenLink("Constituents", "Constituent search");
}

[When(@"set the Last/Org/Group name field value to ""(.*)""")]
public void WhenSetTheLastOrgGroupNameFieldValueTo(string fieldValue)
{
    SearchDialog.SetTextField(Dialog.getXInput("ConstituentSearchbyNameorLookupID", "KEYNAME"), fieldValue);
}

[Then(@"the Last/Org/Group name field is ""(.*)""")]
public void ThenTheLastOrgGroupNameFieldIs(string expectedValue)
{
    SearchDialog.ElementValueIsSet(Dialog.getXInput("ConstituentSearchbyNameorLookupID", "KEYNAME"), expectedValue);
}