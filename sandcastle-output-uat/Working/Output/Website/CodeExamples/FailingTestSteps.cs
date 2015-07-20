using Blueshirt.Core.Base;
using TechTalk.SpecFlow;

namespace Delving_Deeper
{
	[Binding]
	public class SampleTestsSteps : BaseSteps
	{
		[Given(@"I have logged into BBCRM and navigated to functional area ""(.*)""")]
		public void GivenIHaveLoggedIntoBbcrmAndNavigatedToFunctionalArea(string functionalArea)
		{
			ScenarioContext.Current.Pending();
		}

		[When(@"I navigate to functional area ""(.*)""")]
		public void WhenINavigateToFunctionalArea(string functionalArea)
		{
			ScenarioContext.Current.Pending();
		}

		[Then(@"the panel header caption is ""(.*)""")]
		public void ThenThePanelHeaderCaptionIs(string headerCaption)
		{
			ScenarioContext.Current.Pending();
		}
	}
}