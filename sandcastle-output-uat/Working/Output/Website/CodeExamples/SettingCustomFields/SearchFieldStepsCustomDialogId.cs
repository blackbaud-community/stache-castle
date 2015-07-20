[When(@"set the Last/Org/Group name field value to ""(.*)""")]
public void WhenSetTheLastOrgGroupNameFieldValueTo(string fieldValue)
{
    SearchDialog.SetTextField(Dialog.getXInput("UniversityofOxfordConstituentSearch", "KEYNAME"), fieldValue);
}

[Then(@"the Last/Org/Group name field is ""(.*)""")]
public void ThenTheLastOrgGroupNameFieldIs(string expectedValue)
{
    SearchDialog.ElementValueIsSet(Dialog.getXInput("UniversityofOxfordConstituentSearch", "KEYNAME"), expectedValue);
}