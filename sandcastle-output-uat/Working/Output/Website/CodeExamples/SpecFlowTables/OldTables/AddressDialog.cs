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
                string caption = row["Field"];
                string value = row["Value"];
                switch (caption)
                {
                    case "Type":
                        SetDropDown(getXInput("AddressAddForm2", "_ADDRESSTYPECODEID_value"), value);
                        break;
                    case "Country":
                        SetDropDown(getXInput("AddressAddForm2", "_COUNTRYID_value"), value);
                        break;
                    case "Address":
                        SetTextField(getXTextArea("AddressAddForm2", "_ADDRESSBLOCK_value"), value);
                        break;
                    case "City":
                        SetTextField(getXInput("AddressAddForm2", "_CITY_value"), value);
                        break;
                    case "State":
                        SetDropDown(getXInput("AddressAddForm2", "_STATEID_value"), value);
                        break;
                    case "ZIP":
                        SetTextField(getXInput("AddressAddForm2", "_POSTCODE_value"), value);
                        break;
                    case "Do not send mail to this address":
                        SetCheckbox(getXInput("AddressAddForm2", "_DONOTMAIL_value"), value);
                        break;
                    default:
                        throw new NotImplementedException(String.Format("Field '{0}' is not implemented.", caption));
                }
            }
        }
    }
}
