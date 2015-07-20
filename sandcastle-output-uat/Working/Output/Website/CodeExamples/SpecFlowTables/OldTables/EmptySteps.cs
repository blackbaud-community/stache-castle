using System;
using Blueshirt.Core.Base;
using Blueshirt.Core.Crm;
using TechTalk.SpecFlow;

namespace Delving_Deeper
{
    [Binding]
    public class SampleTestsSteps : BaseSteps
    {
        [Given(@"I have logged into BBCRM")]
        public void GivenIHaveLoggedIntoBBCRM()
        {
            BBCRMHomePage.Logon();
        }

        [Given(@"a constituent exists with last name ""(.*)""")]
        public void GivenAConstituentExistsWithLastName(string p0)
        {
            ScenarioContext.Current.Pending();
        }

        [When(@"I add an address to the current constituent")]
        public void WhenIAddAnAddressToTheCurrentConstituent(Table table)
        {
            ScenarioContext.Current.Pending();
        }

        [Then(@"an address exists")]
        public void ThenAnAddressExists(Table table)
        {
            ScenarioContext.Current.Pending();
        }

    }
}
