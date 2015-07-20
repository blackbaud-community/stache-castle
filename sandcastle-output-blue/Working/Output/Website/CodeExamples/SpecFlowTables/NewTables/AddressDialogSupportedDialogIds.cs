public class AddressDialog : Dialog
{
    protected static readonly string[] DialogIds = { "AddressAddForm2", "AddressEditForm" };

    protected static readonly IDictionary<string, CrmField> SupportedFields = new Dictionary<string, CrmField>
    {
        {"Type", new CrmField("_ADDRESSTYPECODEID_value", FieldType.Dropdown)},
        {"Country", new CrmField("_COUNTRYID_value", FieldType.Dropdown)},
        {"Address", new CrmField("_ADDRESSBLOCK_value", FieldType.TextArea)},
        {"City", new CrmField("_CITY_value", FieldType.TextInput)},
        {"State", new CrmField("_STATEID_value", FieldType.Dropdown)},
        {"ZIP", new CrmField("_POSTCODE_value", FieldType.TextInput)},
        {"Do not send mail to this address", new CrmField("_DONOTMAIL_value", FieldType.Checkbox)}
    };

    public static void SetAddressFields(TableRow addressFields)
    {
        OpenTab("Address");
        SetFields(GetDialogId(DialogIds), addressFields, SupportedFields);
    }

}