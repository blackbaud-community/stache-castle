using Blueshirt.Core.Crm;
using TechTalk.SpecFlow;

namespace Delving_Deeper
{
    public class CustomIndividualDialog : IndividualDialog
    {
        public new static void SetHouseholdFields(TableRow fields)
        {
            OpenTab("Household");
            if (fields.ContainsKey("Related individual"))
            {
                WaitClick(getXInputNewFormTrigger(getXInput(dialogId, "_SPOUSEID_value")));
                SetTextField(getXInput("IndividualSpouseBusinessSpouseForm", "_SPOUSE_LASTNAME_value"), fields["Related individual"]);
                OK();
                fields["Related individual"] = null;
            }
            IndividualDialog.SetHouseholdFields(fields);
        }
    }
}
