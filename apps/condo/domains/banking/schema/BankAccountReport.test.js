/**
 * Generated by `createschema banking.BankAccountReport 'account:Relationship:BankAccount:CASCADE; organization:Relationship:Organization:CASCADE; version:Integer; template:Select:expenses_grouped_by_category_and_cost_item; period:Text; amount:Decimal; amountAt:DateTimeUtc; publishedAt:DateTimeUtc; totalIncome:Decimal; totalOutcome:Decimal; data:Json;'`
 */

const { faker } = require('@faker-js/faker')
const dayjs = require('dayjs')

const {
    makeLoggedInAdminClient,
    makeClient,
    expectToThrowValidationFailureError,
    expectValuesOfCommonFields,
} = require('@open-condo/keystone/test.utils')
const {
    expectToThrowAuthenticationErrorToObj, expectToThrowAuthenticationErrorToObjects,
    expectToThrowAccessDeniedErrorToObj,
} = require('@open-condo/keystone/test.utils')

const { EXPENSES_GROUPED_BY_CATEGORY_AND_COST_ITEM } = require('@condo/domains/banking/constants')
const { BANK_INTEGRATION_IDS } = require('@condo/domains/banking/constants')
const { BankAccountReport, createTestBankAccountReport, updateTestBankAccountReport } = require('@condo/domains/banking/utils/testSchema')
const { createTestBankIntegrationAccountContext, createTestBankAccount, BankIntegration } = require('@condo/domains/banking/utils/testSchema')
const { createTestOrganization, createTestOrganizationEmployeeRole, createTestOrganizationEmployee } = require('@condo/domains/organization/utils/testSchema')
const { createTestProperty } = require('@condo/domains/property/utils/testSchema')
const { createTestResident } = require('@condo/domains/resident/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser, makeClientWithResidentUser } = require('@condo/domains/user/utils/testSchema')

let adminClient
let bankIntegration
describe('BankAccountReport', () => {
    beforeAll(async () => {
        adminClient = await makeLoggedInAdminClient()
        bankIntegration = await BankIntegration.getOne(adminClient, { id: BANK_INTEGRATION_IDS['1CClientBankExchange'] })
    })

    describe('CRUD tests', () => {
        describe('create', () => {
            test('admin can', async () => {
                const [organization] = await createTestOrganization(adminClient)
                const [bankIntegrationAccountContext] = await createTestBankIntegrationAccountContext(adminClient, bankIntegration, organization)
                const [account] = await createTestBankAccount(adminClient, organization, {
                    integrationContext: { connect: { id: bankIntegrationAccountContext.id } },
                })
                const [obj, attrs] = await createTestBankAccountReport(adminClient, account, organization)

                expectValuesOfCommonFields(obj, attrs, adminClient)
                expect(obj.account.id).toEqual(account.id)
                expect(obj.version).toEqual(attrs.version)
                expect(obj.template).toEqual(attrs.template)
                expect(obj.period).toEqual(attrs.period)
                expect(parseFloat(obj.amount)).toBeCloseTo(parseFloat(attrs.amount), 2)
                expect(obj.amountAt).toEqual(attrs.amountAt)
                expect(obj.publishedAt).toEqual(attrs.publishedAt)
                expect(parseFloat(obj.totalIncome)).toBeCloseTo(parseFloat(attrs.totalIncome), 2)
                expect(parseFloat(obj.totalOutcome)).toBeCloseTo(parseFloat(attrs.totalOutcome), 2)
                expect(obj.data).toEqual(attrs.data)
            })

            test('user cannot', async () => {
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()

                const [organization] = await createTestOrganization(adminClient)
                const [bankIntegrationAccountContext] = await createTestBankIntegrationAccountContext(adminClient, bankIntegration, organization)
                const [account] = await createTestBankAccount(adminClient, organization, {
                    integrationContext: { connect: { id: bankIntegrationAccountContext.id } },
                })
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestBankAccountReport(userClient, account, organization)
                })
            })

            test('anonymous can\'t', async () => {
                const [organization] = await createTestOrganization(adminClient)
                const [bankIntegrationAccountContext] = await createTestBankIntegrationAccountContext(adminClient, bankIntegration, organization)
                const [account] = await createTestBankAccount(adminClient, organization, {
                    integrationContext: { connect: { id: bankIntegrationAccountContext.id } },
                })

                const anonymousClient = await makeClient()

                await expectToThrowAuthenticationErrorToObj(async () => {
                    await createTestBankAccountReport(anonymousClient, account, organization)
                })
            })
        })

        describe('update', () => {
            test('admin can', async () => {
                const [organization] = await createTestOrganization(adminClient)
                const [bankIntegrationAccountContext] = await createTestBankIntegrationAccountContext(adminClient, bankIntegration, organization)
                const [account] = await createTestBankAccount(adminClient, organization, {
                    integrationContext: { connect: { id: bankIntegrationAccountContext.id } },
                })
                const [objCreated] = await createTestBankAccountReport(adminClient, account, organization)

                const [obj, attrs] = await updateTestBankAccountReport(adminClient, objCreated.id, {
                    version: objCreated.version + 1,
                    template: EXPENSES_GROUPED_BY_CATEGORY_AND_COST_ITEM,
                    period: dayjs(faker.date.between('2020-01-01T00:00:00.000Z', '2023-01-01T00:00:00.000Z')).format('YYYY-MM'),
                    amount: faker.datatype.number().toString(),
                    amountAt: dayjs().toISOString(),
                    publishedAt: dayjs().toISOString(),
                    totalIncome: faker.datatype.number().toString(),
                    totalOutcome: faker.datatype.number().toString(),
                    data: {
                        categoryGroups: [{
                            id: faker.datatype.uuid(),
                            name: faker.lorem.word(2),
                            costItemGroups: [{
                                id: faker.datatype.uuid(),
                                name: faker.lorem.word(2),
                                sum: faker.datatype.number(),
                                isOutcome: !objCreated.data.categoryGroups[0].costItemGroups[0].isOutcome,
                            }],
                        }],
                    },
                })

                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.v).toEqual(2)
                expect(obj.updatedBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
                expect(obj.version).toEqual(attrs.version)
                expect(obj.template).toEqual(attrs.template)
                expect(obj.period).toEqual(attrs.period)
                expect(parseFloat(obj.amount)).toBeCloseTo(parseFloat(attrs.amount), 2)
                expect(obj.amountAt).toEqual(attrs.amountAt)
                expect(obj.publishedAt).toEqual(attrs.publishedAt)
                expect(parseFloat(obj.totalIncome)).toBeCloseTo(parseFloat(attrs.totalIncome), 2)
                expect(parseFloat(obj.totalOutcome)).toBeCloseTo(parseFloat(attrs.totalOutcome), 2)
                expect(obj.data).toEqual(attrs.data)
            })

            test('user can update only publishedAt field', async () => {
                const [organization] = await createTestOrganization(adminClient)
                const [bankIntegrationAccountContext] = await createTestBankIntegrationAccountContext(adminClient, bankIntegration, organization)
                const [account] = await createTestBankAccount(adminClient, organization, {
                    integrationContext: { connect: { id: bankIntegrationAccountContext.id } },
                })
                const [objCreated] = await createTestBankAccountReport(adminClient, account, organization)

                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                const [role] = await createTestOrganizationEmployeeRole(adminClient, organization, {
                    canManageBankAccountReports: true,
                })
                await createTestOrganizationEmployee(adminClient, organization, userClient.user, role)

                const newPublishedAtValue = dayjs().toISOString()

                const [obj, attrs] = await updateTestBankAccountReport(userClient, objCreated.id, {
                    publishedAt: newPublishedAtValue,
                })
                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.v).toEqual(2)
                expect(obj.updatedBy).toEqual(expect.objectContaining({ id: userClient.user.id }))
                expect(obj.publishedAt).toEqual(newPublishedAtValue)

                const forbiddenFields = {
                    account: { connect: { id: account.id } },
                    version: 2,
                    template: EXPENSES_GROUPED_BY_CATEGORY_AND_COST_ITEM,
                    period: '2023-04',
                    amount: faker.datatype.number().toString(),
                    amountAt: dayjs().toISOString(),
                    totalIncome: faker.datatype.number().toString(),
                    totalOutcome: faker.datatype.number().toString(),
                }
                for (let field in forbiddenFields) {
                    await expectToThrowAccessDeniedErrorToObj(async () => {
                        await updateTestBankAccountReport(userClient, objCreated.id, {
                            [field]: forbiddenFields[field],
                        })
                    })
                }
            })

            test('anonymous can\'t', async () => {
                const [organization] = await createTestOrganization(adminClient)
                const [bankIntegrationAccountContext] = await createTestBankIntegrationAccountContext(adminClient, bankIntegration, organization)
                const [account] = await createTestBankAccount(adminClient, organization, {
                    integrationContext: { connect: { id: bankIntegrationAccountContext.id } },
                })
                const [objCreated] = await createTestBankAccountReport(adminClient, account, organization)

                const anonymousClient = await makeClient()
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTestBankAccountReport(anonymousClient, objCreated.id)
                })
            })
        })

        describe('hard delete', () => {
            test('admin can\'t', async () => {
                const [organization] = await createTestOrganization(adminClient)
                const [bankIntegrationAccountContext] = await createTestBankIntegrationAccountContext(adminClient, bankIntegration, organization)
                const [account] = await createTestBankAccount(adminClient, organization, {
                    integrationContext: { connect: { id: bankIntegrationAccountContext.id } },
                })
                const [objCreated] = await createTestBankAccountReport(adminClient, account, organization)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await BankAccountReport.delete(adminClient, objCreated.id)
                })
            })

            test('user can\'t', async () => {
                const [organization] = await createTestOrganization(adminClient)
                const [bankIntegrationAccountContext] = await createTestBankIntegrationAccountContext(adminClient, bankIntegration, organization)
                const [account] = await createTestBankAccount(adminClient, organization, {
                    integrationContext: { connect: { id: bankIntegrationAccountContext.id } },
                })
                const [objCreated] = await createTestBankAccountReport(adminClient, account, organization)

                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await BankAccountReport.delete(userClient, objCreated.id)
                })
            })

            test('anonymous can\'t', async () => {
                const [organization] = await createTestOrganization(adminClient)
                const [bankIntegrationAccountContext] = await createTestBankIntegrationAccountContext(adminClient, bankIntegration, organization)
                const [account] = await createTestBankAccount(adminClient, organization, {
                    integrationContext: { connect: { id: bankIntegrationAccountContext.id } },
                })
                const [objCreated] = await createTestBankAccountReport(adminClient, account, organization)

                const anonymousClient = await makeClient()
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await BankAccountReport.delete(anonymousClient, objCreated.id)
                })
            })
        })

        describe('read', () => {
            test('admin can', async () => {
                const [organization] = await createTestOrganization(adminClient)
                const [bankIntegrationAccountContext] = await createTestBankIntegrationAccountContext(adminClient, bankIntegration, organization)
                const [account] = await createTestBankAccount(adminClient, organization, {
                    integrationContext: { connect: { id: bankIntegrationAccountContext.id } },
                })
                const [obj] = await createTestBankAccountReport(adminClient, account, organization)

                const objs = await BankAccountReport.getAll(adminClient, {}, { sortBy: ['updatedAt_DESC'] })

                expect(objs.length).toBeGreaterThanOrEqual(1)
                expect(objs).toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        id: obj.id,
                    }),
                ]))
            })

            test('user can read only records, associated with property where it is a resident', async () => {
                const [organization] = await createTestOrganization(adminClient)
                const [property] = await createTestProperty(adminClient, organization)
                const [bankIntegrationAccountContext] = await createTestBankIntegrationAccountContext(adminClient, bankIntegration, organization)
                const [account] = await createTestBankAccount(adminClient, organization, {
                    integrationContext: { connect: { id: bankIntegrationAccountContext.id } },
                    property: { connect: { id: property.id } },
                })
                const [obj] = await createTestBankAccountReport(adminClient, account, organization)

                const userClient = await makeClientWithResidentUser()
                await createTestResident(adminClient, userClient.user, property)
                const objs = await BankAccountReport.getAll(userClient, {}, { sortBy: ['updatedAt_DESC'] })

                expect(objs).toHaveLength(1)
                expect(objs[0]).toMatchObject({
                    id: obj.id,
                })

                const [anotherProperty] = await createTestProperty(adminClient, organization)
                const [anotherBankIntegrationAccountContext] = await createTestBankIntegrationAccountContext(adminClient, bankIntegration, organization)
                const [anotherAccount] = await createTestBankAccount(adminClient, organization, {
                    integrationContext: { connect: { id: anotherBankIntegrationAccountContext.id } },
                    property: { connect: { id: anotherProperty.id } },
                })
                await createTestBankAccountReport(adminClient, anotherAccount, organization)

                const sameObjs = await BankAccountReport.getAll(userClient, {}, { sortBy: ['updatedAt_DESC'] })

                expect(sameObjs).toHaveLength(1)
                expect(sameObjs[0]).toMatchObject({
                    id: obj.id,
                })

                const notResidentUserClient = await makeClientWithNewRegisteredAndLoggedInUser()
                const objsForNotResident = await BankAccountReport.getAll(notResidentUserClient, {}, { sortBy: ['updatedAt_DESC'] })

                expect(objsForNotResident).toHaveLength(0)
            })

            test('user can read only records, associated with organization where it is an employee', async () => {
                const [organization] = await createTestOrganization(adminClient)
                const [property] = await createTestProperty(adminClient, organization)
                const [bankIntegrationAccountContext] = await createTestBankIntegrationAccountContext(adminClient, bankIntegration, organization)
                const [account] = await createTestBankAccount(adminClient, organization, {
                    integrationContext: { connect: { id: bankIntegrationAccountContext.id } },
                    property: { connect: { id: property.id } },
                })
                const [obj] = await createTestBankAccountReport(adminClient, account, organization)

                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()

                const objs1 = await BankAccountReport.getAll(userClient, {}, { sortBy: ['updatedAt_DESC'] })
                expect(objs1).toHaveLength(0)

                // NOTE(antonal): `canManageBankAccountReports` ability is not used here because there is no reason to restrict ordinary employees from viewing reports of theirs organization
                const [role] = await createTestOrganizationEmployeeRole(adminClient, organization)
                await createTestOrganizationEmployee(adminClient, organization, userClient.user, role, {
                    isAccepted: true,
                })
                const objs2 = await BankAccountReport.getAll(userClient, {}, { sortBy: ['updatedAt_DESC'] })
                expect(objs2).toHaveLength(1)
                expect(objs2[0]).toMatchObject({
                    id: obj.id,
                })

                const notStaffUserClient = await makeClientWithNewRegisteredAndLoggedInUser()
                const objsForNotStaff = await BankAccountReport.getAll(notStaffUserClient, {}, { sortBy: ['updatedAt_DESC'] })

                expect(objsForNotStaff).toHaveLength(0)
            })

            test('anonymous cannot', async () => {
                const client = await makeClient()
                await expectToThrowAuthenticationErrorToObjects(async () => {
                    await BankAccountReport.getAll(client, {}, { sortBy: ['updatedAt_DESC'] })
                })
            })
        })
    })

    describe('Validation tests', () => {
        test('Should have correct dv field (=== 1)', async () => {
            const [organization] = await createTestOrganization(adminClient)
            const [bankIntegrationAccountContext] = await createTestBankIntegrationAccountContext(adminClient, bankIntegration, organization)
            const [account] = await createTestBankAccount(adminClient, organization, {
                integrationContext: { connect: { id: bankIntegrationAccountContext.id } },
            })
            const [obj] = await createTestBankAccountReport(adminClient, account, organization)

            expect(obj.dv).toEqual(1)
        })

        describe('JSON schema of "data" field', () => {

            let organization
            let bankIntegrationAccountContext
            let account

            beforeAll(async () => {
                organization = (await createTestOrganization(adminClient))[0]
                bankIntegrationAccountContext = (await createTestBankIntegrationAccountContext(adminClient, bankIntegration, organization))[0]
                account = (await createTestBankAccount(adminClient, organization, {
                    integrationContext: { connect: { id: bankIntegrationAccountContext.id } },
                }))[0]
            })

            const cases = [
                [
                    'data field validation error. JSON not in the correct format - path:/categoryGroups/0 msg:must NOT have additional properties',
                    {
                        categoryGroups: [{
                            forbiddenField: faker.lorem.word(2),
                            id: faker.datatype.uuid(),
                            name: faker.lorem.word(2),
                            costItemGroups: [{
                                id: faker.datatype.uuid(),
                                name: faker.lorem.word(2),
                                sum: faker.datatype.number(),
                                isOutcome: faker.datatype.boolean(),
                            }],
                        }],
                    },
                ],
                [
                    'data field validation error. JSON not in the correct format - path:/categoryGroups/0 msg:must have required property \'id\'',
                    {
                        categoryGroups: [{
                            name: faker.lorem.word(2),
                            costItemGroups: [{
                                id: faker.datatype.uuid(),
                                name: faker.lorem.word(2),
                                sum: faker.datatype.number(),
                                isOutcome: faker.datatype.boolean(),
                            }],
                        }],
                    },
                ],
                [
                    'data field validation error. JSON not in the correct format - path: msg:must NOT have additional properties',
                    {
                        forbiddenField: 'forbidden-value',
                    },
                ],
                [
                    'data field validation error. JSON not in the correct format - path:/categoryGroups msg:must be array',
                    {
                        categoryGroups: {},
                    },
                ],
                [
                    'data field validation error. JSON not in the correct format - path:/categoryGroups/0 msg:must have required property \'name\'',
                    {
                        categoryGroups: [{
                            forbiddenField: faker.lorem.word(2),
                            id: faker.datatype.uuid(),
                            costItemGroups: [{
                                id: faker.datatype.uuid(),
                                name: faker.lorem.word(2),
                                sum: faker.datatype.number(),
                                isOutcome: faker.datatype.boolean(),
                            }],
                        }],
                    },
                ],
                [
                    'data field validation error. JSON not in the correct format - path:/categoryGroups/0 msg:must have required property \'costItemGroups\'',
                    {
                        categoryGroups: [{
                            forbiddenField: faker.lorem.word(2),
                            id: faker.datatype.uuid(),
                            name: faker.lorem.word(2),
                        }],
                    },
                ],
                [
                    'data field validation error. JSON not in the correct format - path:/categoryGroups/0/id msg:must match format "uuid"',
                    {
                        categoryGroups: [{
                            id: 'incorrect format',
                            name: faker.lorem.word(2),
                            costItemGroups: [{
                                id: faker.datatype.uuid(),
                                name: faker.lorem.word(2),
                                sum: faker.datatype.number(),
                                isOutcome: faker.datatype.boolean(),
                            }],
                        }],
                    },
                ],
                [
                    'data field validation error. JSON not in the correct format - path:/categoryGroups/0/name msg:must be string',
                    {
                        categoryGroups: [{
                            id: faker.datatype.uuid(),
                            name: 123,
                            costItemGroups: [{
                                id: faker.datatype.uuid(),
                                name: faker.lorem.word(2),
                                sum: faker.datatype.number(),
                                isOutcome: faker.datatype.boolean(),
                            }],
                        }],
                    },
                ],
                [
                    'data field validation error. JSON not in the correct format - path:/categoryGroups/0/costItemGroups/0 msg:must NOT have additional properties',
                    {
                        categoryGroups: [{
                            id: faker.datatype.uuid(),
                            name: faker.lorem.word(2),
                            costItemGroups: [{
                                forbiddenField: faker.lorem.word(2),
                                id: faker.datatype.uuid(),
                                name: faker.lorem.word(2),
                                sum: faker.datatype.number(),
                                isOutcome: faker.datatype.boolean(),

                            }],
                        }],
                    },
                ],
                [
                    'data field validation error. JSON not in the correct format - path:/categoryGroups/0/costItemGroups/0/sum msg:must be number',
                    {
                        categoryGroups: [{
                            id: faker.datatype.uuid(),
                            name: faker.lorem.word(2),
                            costItemGroups: [{
                                id: faker.datatype.uuid(),
                                name: faker.lorem.word(2),
                                sum: 'forbidden string value',
                                isOutcome: faker.datatype.boolean(),
                            }],
                        }],
                    },
                ],
                [
                    'data field validation error. JSON not in the correct format - path:/categoryGroups/0/costItemGroups/0/name msg:must be string',
                    {
                        categoryGroups: [{
                            id: faker.datatype.uuid(),
                            name: faker.lorem.word(2),
                            costItemGroups: [{
                                id: faker.datatype.uuid(),
                                name: 123,
                                sum: faker.datatype.number(),
                                isOutcome: faker.datatype.boolean(),
                            }],
                        }],
                    },
                ],
                [
                    'data field validation error. JSON not in the correct format - path:/categoryGroups/0/costItemGroups/0 msg:must have required property \'isOutcome\'',
                    {
                        categoryGroups: [{
                            id: faker.datatype.uuid(),
                            name: faker.lorem.word(2),
                            costItemGroups: [{
                                id: faker.datatype.uuid(),
                                name: 123,
                                sum: faker.datatype.number(),
                            }],
                        }],
                    },
                ],
            ]

            test.each(cases)('returns error %p', async (error, invalidData) => {
                await expectToThrowValidationFailureError(async () => {
                    await createTestBankAccountReport(adminClient, account, organization, {
                        data: invalidData,
                    })
                }, error)
            })
        })

        test('format of "period" field', async () => {
            const [organization] = await createTestOrganization(adminClient)
            const [bankIntegrationAccountContext] = await createTestBankIntegrationAccountContext(adminClient, bankIntegration, organization)
            const [account] = await createTestBankAccount(adminClient, organization, {
                integrationContext: { connect: { id: bankIntegrationAccountContext.id } },
            })
            await expectToThrowValidationFailureError(async () => {
                await createTestBankAccountReport(adminClient, account, organization, {
                    period: '2023-lksjdf',
                })
            }, 'Incorrect format. Expected "YYYY-MM" for monthly, "YYYY" for yearly, "YYYY-QN" for quarterly reports')

            await expectToThrowValidationFailureError(async () => {
                await createTestBankAccountReport(adminClient, account, organization, {
                    period: '2023-022',
                })
            }, 'Incorrect format. Expected "YYYY-MM" for monthly, "YYYY" for yearly, "YYYY-QN" for quarterly reports')

            await expectToThrowValidationFailureError(async () => {
                await createTestBankAccountReport(adminClient, account, organization, {
                    period: '2023-02-01',
                })
            }, 'Incorrect format. Expected "YYYY-MM" for monthly, "YYYY" for yearly, "YYYY-QN" for quarterly reports')

            await expectToThrowValidationFailureError(async () => {
                await createTestBankAccountReport(adminClient, account, organization, {
                    period: 'lsdkjf',
                })
            }, 'Incorrect format. Expected "YYYY-MM" for monthly, "YYYY" for yearly, "YYYY-QN" for quarterly reports')

            await expectToThrowValidationFailureError(async () => {
                await createTestBankAccountReport(adminClient, account, organization, {
                    period: dayjs().toISOString(),
                })
            }, 'Incorrect format. Expected "YYYY-MM" for monthly, "YYYY" for yearly, "YYYY-QN" for quarterly reports')

            const obj1 = await createTestBankAccountReport(adminClient, account, organization, {
                period: '2023',
            })
            expect(obj1).toBeDefined()

            const obj2 = await createTestBankAccountReport(adminClient, account, organization, {
                period: '2023-02',
            })
            expect(obj2).toBeDefined()

            const obj3 = await createTestBankAccountReport(adminClient, account, organization, {
                period: '2023-Q1',
            })
            expect(obj3).toBeDefined()
        })
    })
})
