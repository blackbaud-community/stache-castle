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

        [When(@"I add constituent")]
        public void WhenIAddConstituent(Table constituents)
        {
            foreach (var constituent in constituents.Rows)
            {
                BBCRMHomePage.OpenConstituentsFA();
                ConstituentsFunctionalArea.AddAnIndividual(groupCaption: "Add Records");
                IndividualDialog.SetIndividualFields(constituent);
                IndividualDialog.Save();
            }
        }

        [Then(@"a constituent is created")]
        public void ThenAConstituentIsCreated()
        {
            if (!BaseComponent.Exists(Panel.getXPanelHeader("individual"))) FailTest("A constituent panel did not load.");
        }

    }
}
