public static void SetCustomField(string fieldCaption, string value)
{
    //Use the same IDictionary<string, CrmField> CustomSupportedFields from the Overload Approach
    SetField(GetDialogId(DialogIds), fieldCaption, value, CustomSupportedFields);
}

