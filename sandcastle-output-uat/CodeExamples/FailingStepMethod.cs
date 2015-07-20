[Given(@"I have logged into BBCRM and navigated to functional area ""(.*)""")]
public void GivenIHaveLoggedIntoBbcrmAndNavigatedToFunctionalArea(string functionalArea)
{
	BBCRMHomePage.Logon();
	MyCustomBBCrmHomePage.NavigateToFunctionalArea(functionalArea);
}