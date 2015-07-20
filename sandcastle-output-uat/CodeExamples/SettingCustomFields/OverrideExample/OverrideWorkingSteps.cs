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

        [Then(@"a constituent is created")]
        public void ThenAConstituentIsCreated()
        {
            if (!BaseComponent.Exists(Panel.getXPanelHeader("individual"))) FailTest("A constituent panel did not load.");
        }

        [When(@"I start to add a constituent")]
        public void WhenIStartToAddAConstituent(Table constituents)
        {
            foreach (var constituent in constituents.Rows)
            {
                BBCRMHomePage.OpenConstituentsFA();
                constituent["Last name"] += uniqueStamp;
                ConstituentsFunctionalArea.AddAnIndividual();
                IndividualDialog.SetIndividualFields(constituent);
            }
        }

        [When(@"I save the add an individual dialog")]
        public void WhenISaveTheAddAnIndividualDialog()
        {
            IndividualDialog.Save();
        }

        [Given(@"a constituent exists")]
        public void GivenAConstituentExists(Table constituents)
        {
            foreach (var constituent in constituents.Rows)
            {
                BBCRMHomePage.OpenConstituentsFA();
                constituent["Last name"] += uniqueStamp;
                ConstituentsFunctionalArea.AddAnIndividual(constituent);
            }
        }

        [When(@"set the household fields")]
        public void WhenSetTheHouseholdFields(Table fieldsTable)
        {
            foreach (var fieldValues in fieldsTable.Rows)
            {
                IndividualDialog.SetHouseholdFields(fieldValues);
            }
        }
    }
}
