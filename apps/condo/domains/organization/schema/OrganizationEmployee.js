/**
 * Generated by `createschema organization.OrganizationEmployee 'organization:Relationship:Organization:CASCADE; user:Relationship:User:SET_NULL; inviteCode:Text; name:Text; email:Text; phone:Text; role:Relationship:OrganizationEmployeeRole:SET_NULL; isAccepted:Checkbox; isRejected:Checkbox' --force`
 */
const { faker } = require('@faker-js/faker')
const get = require('lodash/get')
const { v4: uuid } = require('uuid')

const { userIsAdmin } = require('@open-condo/keystone/access')
const { GQLError, GQLErrorCode: { BAD_USER_INPUT } } = require('@open-condo/keystone/errors')
const { historical, versioned, tracked, softDeleted, uuided, dvAndSender } = require('@open-condo/keystone/plugins')
const { GQLListSchema, getByCondition, find } = require('@open-condo/keystone/schema')

const { NOT_FOUND } = require('@condo/domains/common/constants/errors')
const { EMAIL_WRONG_FORMAT_ERROR } = require('@condo/domains/common/constants/errors')
const { normalizeEmail } = require('@condo/domains/common/utils/mail')
const { normalizePhone } = require('@condo/domains/common/utils/phone')
const { hasDbFields, hasOneOfFields } = require('@condo/domains/common/utils/validation.utils')
const access = require('@condo/domains/organization/access/OrganizationEmployee')
const { ALREADY_INVITED_EMAIL, ALREADY_INVITED_PHONE } = require('@condo/domains/organization/constants/errors')
const { ORGANIZATION_OWNED_FIELD } = require('@condo/domains/organization/schema/fields')
const { resetUserEmployeesCache } = require('@condo/domains/organization/utils/accessSchema')
const { softDeletePropertyScopeOrganizationEmployee } = require('@condo/domains/scope/utils/serverSchema')


const ERRORS = {
    ALREADY_INVITED_EMAIL: {
        mutation: 'updateOrganizationEmployee',
        code: BAD_USER_INPUT,
        type: ALREADY_INVITED_EMAIL,
        message: 'Employee with same email already invited into the organization',
        messageForUser: 'api.organization.organizationEmployee.ALREADY_INVITED_EMAIL',
        variable: ['email'],
    },
    ALREADY_INVITED_PHONE: {
        mutation: 'updateOrganizationEmployee',
        code: BAD_USER_INPUT,
        type: ALREADY_INVITED_PHONE,
        message: 'Employee with same phone already invited into the organization',
        messageForUser: 'api.organization.organizationEmployee.ALREADY_INVITED_PHONE',
        variable: ['phone'],
    },
    NOT_FOUND_ROLE: {
        code: BAD_USER_INPUT,
        type: NOT_FOUND,
        variable: ['data', 'role'],
        message: 'Role not found for the specified organization',
        messageForUser: 'api.organization.organizationEmployee.NOT_FOUND_ROLE',
    },
}

const OrganizationEmployee = new GQLListSchema('OrganizationEmployee', {
    schemaDoc: 'B2B customer employees. ' +
        'For invite employee should use inviteNewOrganizationEmployee and reInviteOrganizationEmployee',
    fields: {
        organization: { ...ORGANIZATION_OWNED_FIELD, ref: 'Organization.employees' },
        user: {
            schemaDoc: 'If user exists => invite is matched by email/phone (user can reject or accept it)',
            type: 'Relationship',
            ref: 'User',
            isRequired: false,
            knexOptions: { isNotNullable: false }, // Relationship only!
            kmigratorOptions: { null: true, on_delete: 'models.SET_NULL' },
            access: {
                read: true,
                update: userIsAdmin,
                // Allow employee to assign user for the first time, when it creates another employee
                create: access.canManageOrganizationEmployees,
            },
        },
        inviteCode: {
            schemaDoc: 'Secret invite code (used for accept invite verification)',
            type: 'Uuid',
            defaultValue: () => uuid(),
            kmigratorOptions: { null: true, unique: true },
            access: {
                read: userIsAdmin,
                update: userIsAdmin,
                create: userIsAdmin,
            },
        },
        name: {
            factory: () => faker.fake('{{name.suffix}} {{name.firstName}} {{name.lastName}}'),
            type: 'Text',
        },
        email: {
            factory: () => faker.internet.exampleEmail().toLowerCase(),
            type: 'Text',
            isRequired: false,
            kmigratorOptions: { null: true },
            hooks: {
                resolveInput: async ({ resolvedData }) => {
                    return normalizeEmail(resolvedData['email']) || resolvedData['email']
                },
                validateInput: async ({ resolvedData, existingItem, operation, context, addFieldValidationError }) => {
                    const resolvedEmail = resolvedData['email']
                    if (!resolvedEmail) return

                    if (resolvedEmail && normalizeEmail(resolvedEmail) !== resolvedEmail) {
                        addFieldValidationError(`${EMAIL_WRONG_FORMAT_ERROR}mail] invalid format`)
                    }

                    if (operation === 'update') {
                        const employeeWithSameEmail = await find('OrganizationEmployee', {
                            id_not: existingItem.id,
                            deletedAt: null,
                            organization: { id: existingItem.organization },
                            OR: [
                                { email: resolvedEmail },
                                { user: { email: resolvedEmail } },
                            ],
                        })

                        if (employeeWithSameEmail.length > 0) {
                            throw new GQLError(ERRORS.ALREADY_INVITED_EMAIL, context)
                        }
                    }
                },
            },
        },
        phone: {
            type: 'Text',
            isRequired: false,
            kmigratorOptions: { null: true },
            hooks: {
                resolveInput: async ({ resolvedData }) => {
                    if (resolvedData['phone'] === null) return null
                    return normalizePhone(resolvedData['phone'])
                },
                validateInput: async ({ resolvedData, existingItem, operation, context }) => {
                    const resolvedPhone = resolvedData['phone']
                    if (!resolvedPhone) return

                    if (operation === 'update') {
                        const employeeWithSamePhone = await find('OrganizationEmployee', {
                            id_not: existingItem.id,
                            deletedAt: null,
                            organization: { id: existingItem.organization },
                            OR: [
                                { phone: resolvedPhone },
                                { user: { phone: resolvedPhone } },
                            ],
                        })

                        if (employeeWithSamePhone.length > 0) {
                            throw new GQLError(ERRORS.ALREADY_INVITED_PHONE, context)
                        }
                    }
                },
            },
        },
        role: {
            type: 'Relationship',
            ref: 'OrganizationEmployeeRole',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
            hooks: {
                validateInput: async ({ resolvedData, existingItem, context }) => {
                    const newItem = { ...existingItem, ...resolvedData }
                    const organizationId = get(newItem, 'organization')
                    const newRole = get(newItem, 'role')
                    const oldRole = get(existingItem, 'role')

                    if (newRole !== oldRole) {
                        const employeeRole = await getByCondition('OrganizationEmployeeRole', {
                            id: newRole,
                            organization: { id: organizationId },
                        })

                        if (!employeeRole || employeeRole.deletedAt) {
                            throw new GQLError(ERRORS.NOT_FOUND_ROLE, context)
                        }
                    }
                },
            },
        },
        position: {
            schemaDoc: 'Free-form description of the employee\'s position',
            type: 'Text',
            isRequired: false,
        },
        isAccepted: {
            type: 'Checkbox',
            defaultValue: false,
            knexOptions: { isNotNullable: false },
            access: {
                read: true,
                create: userIsAdmin,
                update: userIsAdmin,
            },
        },
        isRejected: {
            type: 'Checkbox',
            defaultValue: false,
            knexOptions: { isNotNullable: false },
            access: {
                read: true,
                create: userIsAdmin,
                update: userIsAdmin,
            },
        },
        isBlocked: {
            schemaDoc: 'Employee is blocked status, used in permissions functions, isBlocked has Free-form description of the employee\'s position over all permissions',
            type: 'Checkbox',
            defaultValue: false,
        },
        hasAllSpecializations: {
            schemaDoc: 'True if employee has all specializations',
            type: 'Checkbox',
            defaultValue: false,
        },
    },
    kmigratorOptions: {
        constraints: [
            {
                type: 'models.UniqueConstraint',
                fields: ['user', 'organization'],
                condition: 'Q(deletedAt__isnull=True)',
                name: 'OrganizationEmployee_unique_user_and_organization',
            },
        ],
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadOrganizationEmployees,
        create: access.canManageOrganizationEmployees,
        update: access.canManageOrganizationEmployees,
        delete: access.canManageOrganizationEmployees,
        auth: true,
    },
    hooks: {
        validateInput: ({ resolvedData, existingItem, addValidationError, context }) => {
            if (!hasDbFields(['organization'], resolvedData, existingItem, context, addValidationError)) return
            if (!hasOneOfFields(['email', 'name', 'phone'], resolvedData, existingItem, addValidationError)) return
        },
        afterChange: async ({ context, operation, existingItem, updatedItem }) => {
            const isSoftDeleteOperation = operation === 'update' && !existingItem.deletedAt && Boolean(updatedItem.deletedAt)

            // NOTE: Creating / updating employee must reset users cache
            const updatedUserId = updatedItem.user
            const existingUserId = get(existingItem, 'user')
            await resetUserEmployeesCache(updatedUserId)
            if (existingUserId && existingUserId !== updatedUserId) {
                await resetUserEmployeesCache(existingUserId)
            }

            // TODO(DOMA-4440): we need to make a tool for automatic cascading soft deletion of related objects
            if (isSoftDeleteOperation) {
                await softDeletePropertyScopeOrganizationEmployee(context, updatedItem)
            }
        },
    },
})

module.exports = {
    OrganizationEmployee,
    ERRORS,
}
