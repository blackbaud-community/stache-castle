using System.Collections.Generic;
using Blueshirt.Core.Base;
using Blueshirt.Core.Crm;

namespace Delving_Deeper
{
    public class CustomIndividualDialog : IndividualDialog
    {
        private static readonly IDictionary<string, CrmField> CustomSupportedFields = new Dictionary<string, CrmField>
        {
            {"Country of Origin", new CrmField("_ATTRIBUTECATEGORYVALUE0_value", FieldType.Dropdown)},
            {"Matriculation Year (Use)", new CrmField("_ATTRIBUTECATEGORYVALUE1_value", FieldType.Dropdown)}
        };
    }
}
