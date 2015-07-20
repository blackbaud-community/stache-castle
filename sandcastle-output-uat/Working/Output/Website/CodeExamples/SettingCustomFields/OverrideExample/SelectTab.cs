using System.Collections.Generic;
using Blueshirt.Core.Base;
using Blueshirt.Core.Crm;
using TechTalk.SpecFlow;

namespace Delving_Deeper
{
    public class CustomIndividualDialog : IndividualDialog
    {
        public new static void SetHouseholdFields(TableRow fields)
        {
            OpenTab("Household");
        }
    }
}
