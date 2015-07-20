using System;
using Blueshirt.Core.Crm;
using TechTalk.SpecFlow;

namespace Delving_Deeper
{
    public class AddressDialog : Dialog
    {
        public static void SetAddressFields(Table addressFields)
        {
            OpenTab("Address");
            foreach (TableRow row in addressFields.Rows)
            {

            }
        }
    }
}
