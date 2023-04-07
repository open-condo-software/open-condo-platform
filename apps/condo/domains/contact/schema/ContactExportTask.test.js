/**
 * Generated by `createschema contact.ContactExportTask 'status:Select:processing,completed,error; format:Select:excel;exportedRecordsCount:Integer; totalRecordsCount:Integer; file?:File; meta?:Json'`
 */
const conf = require('@open-condo/config')
const { makeLoggedInAdminClient, makeClient, UUID_RE, waitFor, expectToThrowValidationFailureError } = require('@open-condo/keystone/test.utils')
const {
    expectToThrowAuthenticationErrorToObj, expectToThrowAuthenticationErrorToObjects,
    expectToThrowAccessDeniedErrorToObj,
} = require('@open-condo/keystone/test.utils')
const { i18n } = require('@open-condo/locales/loader')

const { PROCESSING, COMPLETED, CANCELLED, EXCEL, EXPORT_PROCESSING_BATCH_SIZE } = require('@condo/domains/common/constants/export')
const { downloadFile, readXlsx, expectDataFormat, getTmpFile } = require('@condo/domains/common/utils/testSchema/file')
const { ContactExportTask, createTestContactExportTask, updateTestContactExportTask } = require('@condo/domains/contact/utils/testSchema')
const { createTestContact, ContactRole } = require('@condo/domains/contact/utils/testSchema')
const {
    createTestOrganizationEmployeeRole,
    createTestOrganizationEmployee,
    createTestOrganization,
    createTestOrganizationWithAccessToAnotherOrganization,
} = require('@condo/domains/organization/utils/testSchema')
const { createTestProperty } = require('@condo/domains/property/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')

describe('ContactExportTask', () => {
    let adminClient
    let userClient
    let anotherUserClient
    let anonymousClient

    beforeAll(async () => {
        adminClient = await makeLoggedInAdminClient()
        userClient = await makeClientWithNewRegisteredAndLoggedInUser()
        anotherUserClient = await makeClientWithNewRegisteredAndLoggedInUser()
        anonymousClient = await makeClient()
    })

    describe('CRUD tests', () => {
        describe('create', () => {
            test('admin: can', async () => {
                const [obj] = await createTestContactExportTask(adminClient, adminClient.user)

                expect(obj).toBeDefined()
                expect(obj.createdBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
            })

            test('user can only for himself', async () => {
                const [organization] = await createTestOrganization(adminClient)
                const [role] = await createTestOrganizationEmployeeRole(adminClient, organization, { canManageContacts: true })
                await createTestOrganizationEmployee(adminClient, organization, userClient.user, role)

                const [obj, attrs] = await createTestContactExportTask(userClient, userClient.user, {
                    where: {
                        organization: {
                            id: organization.id,
                        },
                    },
                })

                expect(obj.id).toMatch(UUID_RE)
                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.createdBy).toEqual(expect.objectContaining({ id: userClient.user.id }))
                expect(obj).toHaveProperty('user.id', userClient.user.id)
                expect(obj).toHaveProperty('format', EXCEL)
                expect(obj).toHaveProperty('status', PROCESSING)
            })

            test('user cannot be created if user does not belongs to requested organization in `where` field', async () => {
                const [organization] = await createTestOrganization(adminClient)
                const [role] = await createTestOrganizationEmployeeRole(adminClient, organization, {
                    canManageContacts: true,
                })
                await createTestOrganizationEmployee(adminClient, organization, userClient.user, role)
                const [forbiddenOrganization] = await createTestOrganization(adminClient)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestContactExportTask(userClient, userClient.user, {
                        where: {
                            organization: { id: forbiddenOrganization.id },
                        },
                    })
                })
            })

            test('user cannot create if he have no access to one of provided organizations at where field', async () => {
                const {
                    clientFrom: userClient,
                    organizationTo,
                    organizationFrom,
                } = await createTestOrganizationWithAccessToAnotherOrganization()
                const [forbiddenOrganization] = await createTestOrganization(adminClient)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestContactExportTask(userClient, userClient.user, {
                        where: {
                            organization: { id_in: [organizationTo.id, organizationFrom.id, forbiddenOrganization.id] },
                        },
                    })
                })

            })

            test('user cannot create without specifying organization id at where field', async () => {
                const [organization] = await createTestOrganization(adminClient)
                const [role] = await createTestOrganizationEmployeeRole(adminClient, organization, {
                    canManageContacts: true,
                })
                await createTestOrganizationEmployee(adminClient, organization, userClient.user, role)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestContactExportTask(userClient, userClient.user, {
                        where: { organization: { id: null } },
                    })
                })
            })

            test('cannot be created withot specifying concrete task author', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestContactExportTask(userClient, userClient.user, {
                        user: null,
                    })
                })
            })

            test('cannot be created by user for another user', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestContactExportTask(userClient, anotherUserClient.user)
                })
            })

            test('anonymous can\'t', async () => {
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await createTestContactExportTask(anonymousClient, userClient.user)
                })
            })
        })

        describe('update', () => {
            test('admin can', async () => {
                const [objCreated] = await createTestContactExportTask(adminClient, adminClient.user)

                const [obj, attrs] = await updateTestContactExportTask(adminClient, objCreated.id, {
                    status: COMPLETED,
                })

                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.v).toEqual(2)
                expect(obj.updatedBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
                expect(obj).toHaveProperty('status', COMPLETED)
            })

            test('user can with providing "cancelled" value for "status" field', async () => {
                const [objCreated] = await createTestContactExportTask(adminClient, userClient.user)

                const [obj, attrs] = await updateTestContactExportTask(userClient, objCreated.id, {
                    status: CANCELLED,
                })

                expect(obj.id).toMatch(UUID_RE)
                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.v).toEqual(2)
                expect(obj.updatedBy).toEqual(expect.objectContaining({ id: userClient.user.id }))
                expect(obj).toHaveProperty('status', CANCELLED)
            })

            test('anonymous can\'t', async () => {
                const [objCreated] = await createTestContactExportTask(adminClient, adminClient.user)

                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTestContactExportTask(anonymousClient, objCreated.id, {
                        status: COMPLETED,
                    })
                })
            })
        })

        describe('hard delete', () => {
            test('admin can\'t', async () => {
                const [objCreated] = await createTestContactExportTask(adminClient, adminClient.user)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await ContactExportTask.delete(adminClient, objCreated.id)
                })
            })

            test('user can\'t', async () => {
                const [objCreated] = await createTestContactExportTask(adminClient, userClient.user)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await ContactExportTask.delete(userClient, objCreated.id)
                })
            })

            test('anonymous can\'t', async () => {
                const [objCreated] = await createTestContactExportTask(adminClient, adminClient.user)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await ContactExportTask.delete(anonymousClient, objCreated.id)
                })
            })
        })

        describe('read', () => {
            test('admin can', async () => {
                await createTestContactExportTask(adminClient, adminClient.user)
                await createTestContactExportTask(adminClient, userClient.user)

                const objs = await ContactExportTask.getAll(adminClient, {}, { sortBy: ['updatedAt_DESC'] })

                expect(objs.length).toBeGreaterThanOrEqual(2)
            })

            test('user can only his own task', async () => {
                const userClient1 = await makeClientWithNewRegisteredAndLoggedInUser()
                const userClient2 = await makeClientWithNewRegisteredAndLoggedInUser()
                const userClient3 = await makeClientWithNewRegisteredAndLoggedInUser()

                const [obj1] = await createTestContactExportTask(adminClient, userClient1.user)
                const [obj2] = await createTestContactExportTask(adminClient, userClient2.user)

                const objs1 = await ContactExportTask.getAll(userClient1, {})
                const objs2 = await ContactExportTask.getAll(userClient2, {})
                const objs3 = await ContactExportTask.getAll(userClient3, {})

                expect(objs1).toHaveLength(1)
                expect(objs1[0]).toMatchObject({
                    id: obj1.id,
                })
                expect(objs2).toHaveLength(1)
                expect(objs2[0]).toMatchObject({
                    id: obj2.id,
                })
                expect(objs3).toHaveLength(0)
            })

            test('anonymous can\'t', async () => {
                await createTestContactExportTask(adminClient, adminClient.user)

                await expectToThrowAuthenticationErrorToObjects(async () => {
                    await ContactExportTask.getAll(anonymousClient, {}, { sortBy: ['updatedAt_DESC'] })
                })
            })
        })
    })

    describe('validations', async () => {
        it('should throw validation error if you trying to change status of already completed task', async () => {
            const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
            const [organization] = await createTestOrganization(adminClient)
            const [role] = await createTestOrganizationEmployeeRole(adminClient, organization, {
                canManageContacts: true,
            })
            await createTestOrganizationEmployee(adminClient, organization, userClient.user, role)
            const [createdObj] = await createTestContactExportTask(userClient, userClient.user, {
                where: {
                    organization: { id: organization.id },
                },
                sortBy: 'createdAt_ASC',
                locale: 'ru',
                timeZone: 'Europe/Moscow',
                format: EXCEL,
            })

            await waitFor(async () => {
                const updatedObj = await ContactExportTask.getOne(userClient, { id: createdObj.id })

                expect(updatedObj).toHaveProperty('totalRecordsCount', 0)
                expect(updatedObj).toHaveProperty('exportedRecordsCount', 0)
                expect(updatedObj).toHaveProperty('status', COMPLETED)
            })

            await expectToThrowValidationFailureError(async () => {
                await updateTestContactExportTask(userClient, createdObj.id, { status: CANCELLED })
            }, 'status is already completed')
        })
    })
})

describe('exportContacts', () => {
    it('should create `ContactExportTask` and create xlsx file', async () => {
        const locale = 'ru'
        const timeZone = 'Europe/Moscow'
        const adminClient = await makeLoggedInAdminClient()
        const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
        const [organization] = await createTestOrganization(adminClient)
        const [property] = await createTestProperty(adminClient, organization)
        const [role] = await createTestOrganizationEmployeeRole(adminClient, organization, {
            canManageContacts: true,
        })
        await createTestOrganizationEmployee(adminClient, organization, userClient.user, role)

        const contactsNumberFor2Queries = Math.floor(EXPORT_PROCESSING_BATCH_SIZE * 1.5)
        const contacts = []

        for (let i = contactsNumberFor2Queries; i > 0; i--) {
            const [contact] = await createTestContact(userClient, organization, property)
            contacts.push(contact)
        }

        const [task] = await createTestContactExportTask(userClient, userClient.user, {
            where: {
                organization: { id: organization.id },
            },
            sortBy: 'createdAt_ASC',
            locale,
            timeZone,
            format: EXCEL,
        })

        await waitFor(async () => {
            const updatedTask = await ContactExportTask.getOne(userClient, { id: task.id })

            expect(updatedTask.file).toBeDefined()
            expect(updatedTask.file.publicUrl.length).toBeGreaterThan(1)
            expect(updatedTask).toHaveProperty('exportedRecordsCount', contactsNumberFor2Queries)
            expect(updatedTask).toHaveProperty('totalRecordsCount', contactsNumberFor2Queries)
            expect(updatedTask.exportedRecordsCount).toEqual(contacts.length)
            expect(updatedTask).toHaveProperty('v', 3)
            expect(updatedTask).toHaveProperty('status', COMPLETED)
        })

        const updatedTask = await ContactExportTask.getOne(userClient, { id: task.id })
        const url = updatedTask.file.publicUrl.replace(conf.SERVER_URL, userClient.serverUrl)
        const filename = getTmpFile('xlsx')
        await downloadFile(url, filename)
        const data = await readXlsx(filename)

        const roles = await ContactRole.getAll(userClient, {})
        const indexedRoles = Object.fromEntries(roles.map(role => ([role.id, role.name])))
        const empty = '—'

        expectDataFormat(data, [
            [
                'Имя',
                'Адрес',
                'Помещение',
                'Тип помещения',
                'Телефон',
                'Почта',
                'Роль',
            ],
            ...(contacts.map(contact => [
                contact.name,
                contact.property.address,
                contact.unitName,
                contact.unitType ? i18n(`field.UnitType.${contact.unitType}`, { locale }) : empty,
                contact.phone || empty,
                contact.email || empty,
                contact.role ? indexedRoles[contact.role] : empty,
            ])),
        ])
    })
})