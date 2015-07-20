[Given(@"I have logged into BBCRM and navigated to functional area ""(.*)""")]
public void GivenIHaveLoggedIntoBbcrmAndNavigatedToFunctionalArea(string functionalArea)
{
    BBCRMHomePage.Logon();
    MyCustomBBCrmHomePage.NavigateToFunctionalArea(functionalArea);
}

[When(@"I navigate to functional area ""(.*)""")]
public void WhenINavigateToFunctionalArea(string functionalArea)
{
    MyCustomBBCrmHomePage.NavigateToFunctionalArea(functionalArea);
}

[Then(@"the panel header caption is ""(.*)""")]
public void ThenThePanelHeaderCaptionIs(string headerCaption)
{
    if (!BaseComponent.Exists(Panel.getXPanelHeaderByText(headerCaption))) 
        FailTest(String.Format("'{0}' was not in the header caption.", headerCaption));
}