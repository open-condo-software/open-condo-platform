/**
 * Generated by `createschema scope.PropertyScope 'name:Text; organization:Relationship:Organization:CASCADE;isDefault:Checkbox;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { gql } = require('graphql-tag')

const { generateGqlQueries } = require('@open-condo/codegen/generate.gql')

const { ADDRESS_META_SUBFIELDS_QUERY_LIST } = require('@condo/domains/property/schema/fields/AddressMetaField')

const COMMON_FIELDS = 'id dv sender { dv fingerprint } v deletedAt newId createdBy { id name } updatedBy { id name } createdAt updatedAt'

const PROPERTY_SCOPE_FIELDS = `{ name organization { id } hasAllProperties hasAllEmployees ${COMMON_FIELDS} }`
const PropertyScope = generateGqlQueries('PropertyScope', PROPERTY_SCOPE_FIELDS)

const PROPERTY_SCOPE_ORGANIZATION_EMPLOYEE_FIELDS = `{ propertyScope { id name } employee { id user { id } name isBlocked hasAllSpecializations role { ticketVisibilityType } } ${COMMON_FIELDS} }`
const PropertyScopeOrganizationEmployee = generateGqlQueries('PropertyScopeOrganizationEmployee', PROPERTY_SCOPE_ORGANIZATION_EMPLOYEE_FIELDS)

const PROPERTY_SCOPE_PROPERTY_FIELDS = `{ propertyScope { id } property { id address deletedAt addressMeta { ${ADDRESS_META_SUBFIELDS_QUERY_LIST} } } ${COMMON_FIELDS} }`
const PropertyScopeProperty = generateGqlQueries('PropertyScopeProperty', PROPERTY_SCOPE_PROPERTY_FIELDS)

const ASSIGNEE_SCOPE_FIELDS = `{ user { id } ticket { id } ${COMMON_FIELDS} }`
const AssigneeScope = generateGqlQueries('AssigneeScope', ASSIGNEE_SCOPE_FIELDS)

const EXPORT_PROPERTY_SCOPE_QUERY = gql`
    query exportPropertyScopesToExcel($data: ExportPropertyScopeToExcelInput!) {
        result: exportPropertyScopesToExcel(data: $data) { status, linkToFile }
    }
`

/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    PropertyScope,
    PropertyScopeOrganizationEmployee,
    PropertyScopeProperty,
    AssigneeScope,
    EXPORT_PROPERTY_SCOPE_QUERY,
/* AUTOGENERATE MARKER <EXPORTS> */
}
