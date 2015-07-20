[When(@"I open the constituent search dialog")]
public void WhenIOpenTheConstituentSearchDialog()
{
    BBCRMHomePage.OpenConstituentsFA();
    FunctionalArea.OpenLink("Searching", "Constituent search");
}