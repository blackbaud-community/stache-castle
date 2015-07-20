[Given(@"I have logged into BBCRM")]
public void GivenIHaveLoggedIntoBBCRM()
{
    BBCRMHomePage.Logon();
}

[Given(@"a constituent exists with last name ""(.*)""")]
public void GivenAConstituentExistsWithLastName(string constituent)
{
    constituent += uniqueStamp;
    BBCRMHomePage.OpenConstituentsFA();
    ConstituentsFunctionalArea.AddAnIndividual();
    IndividualDialog.SetLastName(constituent);
    IndividualDialog.Save();
}

[When(@"I add an address to the current constituent")]
public void WhenIAddAnAddressToTheCurrentConstituent(Table addressFields)
{
    ConstituentPanel.SelectTab("Contact");
    ConstituentPanel.ClickSectionAddButton("Addresses");
    AddressDialog.SetAddressFields(addressFields);
    Dialog.Save();
}

[Then(@"an address exists")]
public void ThenAnAddressExists(Table addressFields)
{
    IDictionary<string, string> addressRow = new Dictionary<string, string>();
    foreach (TableRow row in addressFields.Rows)
    {
        addressRow.Add(row["Field"], row["Value"]);
    }
    ConstituentPanel.SelectTab("Contact");
    if (!ConstituentPanel.SectionDatalistRowExists(addressRow, "Addresses")) 
        FailTest(String.Format("Address '{0}' not found.", addressRow.Values));
}