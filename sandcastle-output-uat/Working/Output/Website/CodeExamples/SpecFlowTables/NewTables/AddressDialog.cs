using System;
using System.Collections.Generic;
using Blueshirt.Core.Base;
using Blueshirt.Core.Crm;
using TechTalk.SpecFlow;

namespace Delving_Deeper
{
    public class AddressDialog : Dialog
    {
        protected static readonly IDictionary<string, CrmField> SupportedFields = new Dictionary<string, CrmField>
        {
            {"Type", new CrmField("_ADDRESSTYPECODEID_value", FieldType.Dropdown)},
            {"Country", new CrmField("_COUNTRYID_value", FieldType.Dropdown)},
            {"Address", new CrmField("_ADDRESSBLOCK_value", FieldType.TexArea)},
            {"City", new CrmField("_CITY_value", FieldType.TextInput)},
            {"State", new CrmField("_STATEID_value", FieldType.Dropdown)},
            {"ZIP", new CrmField("_POSTCODE_value", FieldType.TextInput)},
            {"Do not send mail to this address", new CrmField("_DONOTMAIL_value", FieldType.Checkbox)}
        };

        public static void SetAddressFields(TableRow addressFields)
        {
            OpenTab("Address");
            SetFields("AddressAddForm2", addressFields, SupportedFields);
        }
    }
}
