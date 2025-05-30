/**
 * Generated by `createschema banking.BankCostItem 'name:Text;category:Relationship:BankCategory:SET_NULL'`
 */

const {
    makeLoggedInAdminClient,
    makeClient,
    expectToThrowGQLError,
    catchErrorFrom,
    expectValuesOfCommonFields,
} = require('@open-condo/keystone/test.utils')
const {
    expectToThrowAuthenticationErrorToObj, expectToThrowAuthenticationErrorToObjects,
    expectToThrowAccessDeniedErrorToObj,
} = require('@open-condo/keystone/test.utils')

const { BankCostItem, createTestBankCategory, createTestBankCostItem, updateTestBankCostItem } = require('@condo/domains/banking/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')


let admin
let user
let anonymous
let category

describe('BankCostItem', () => {
    beforeAll(async () => {
        admin = await makeLoggedInAdminClient()
        user = await makeClientWithNewRegisteredAndLoggedInUser()
        anonymous = await makeClient()
        const [_category] = await createTestBankCategory(admin)
        category = _category
    })

    describe('CRUD tests', () => {
        describe('create', () => {
            test('admin can', async () => {
                const [obj, attrs] = await createTestBankCostItem(admin, category)

                expectValuesOfCommonFields(obj, attrs, admin)
                expect(obj.name).toEqual(attrs.name)
                expect(obj.isOutcome).toEqual(attrs.isOutcome)
                expect(obj.category).toMatchObject({
                    id: category.id,
                    name: category.name,
                })
            })

            test('user can\'t', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestBankCostItem(user, category)
                })
            })

            test('anonymous can\'t', async () => {
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await createTestBankCostItem(anonymous, category)
                })
            })
        })

        describe('update', () => {
            test('admin can', async () => {
                const [objCreated] = await createTestBankCostItem(admin, category)

                const [obj, attrs] = await updateTestBankCostItem(admin, objCreated.id)

                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.v).toEqual(2)
                expect(obj.name).toEqual(attrs.name)
            })

            test('user can\'t', async () => {
                const [objCreated] = await createTestBankCostItem(admin, category)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestBankCostItem(user, objCreated.id)
                })
            })

            test('anonymous can\'t', async () => {
                const [objCreated] = await createTestBankCostItem(admin, category)

                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTestBankCostItem(anonymous, objCreated.id)
                })
            })
        })

        describe('hard delete', () => {
            test('admin can\'t', async () => {
                const [objCreated] = await createTestBankCostItem(admin,  category)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await BankCostItem.delete(admin, objCreated.id)
                })
            })

            test('user can\'t', async () => {
                const [objCreated] = await createTestBankCostItem(admin, category)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await BankCostItem.delete(user, objCreated.id)
                })
            })

            test('anonymous can\'t', async () => {
                const [objCreated] = await createTestBankCostItem(admin, category)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await BankCostItem.delete(anonymous, objCreated.id)
                })
            })
        })

        describe('read', () => {
            test('admin can', async () => {
                const [obj] = await createTestBankCostItem(admin, category)

                const objs = await BankCostItem.getAll(admin, { id: obj.id }, { sortBy: ['updatedAt_DESC'] })

                expect(objs.length).toBeGreaterThanOrEqual(1)
                expect(objs).toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        id: obj.id,
                        name: obj.name,
                    }),
                ]))
            })

            test('user can', async () => {
                const [obj] = await createTestBankCostItem(admin, category)
                const objs = await BankCostItem.getAll(user, { id: obj.id }, { sortBy: ['updatedAt_DESC'] })
                expect(objs).toHaveLength(1)
                expect(objs[0]).toMatchObject({
                    id: obj.id,
                    name: obj.name,
                })
            })

            test('anonymous can\'t', async () => {
                const [obj] = await createTestBankCostItem(admin, category)

                await expectToThrowAuthenticationErrorToObjects(async () => {
                    await BankCostItem.getAll(anonymous, { id: obj.id }, { sortBy: ['updatedAt_DESC'] })
                })
            })
        })
    })

    describe('Validation tests', () => {
        test('Should have correct dv field (=== 1)', async () => {
            await expectToThrowGQLError(async () => {
                await createTestBankCostItem(admin, category, {
                    dv: 2,
                })
            }, {
                'code': 'BAD_USER_INPUT',
                'type': 'DV_VERSION_MISMATCH',
                'message': 'Wrong value for data version number',
                'mutation': 'createBankCostItem',
                'variable': ['data', 'dv'],
            })
        })
    })

    describe('Associations', () => {
        it('requires category', async () => {
            const [objCreated] = await createTestBankCostItem(admin, category)

            // TODO(pahaz): DOMA-10368 use expectToThrow??
            await catchErrorFrom(async () => {
                await updateTestBankCostItem(admin, objCreated.id, {
                    category: { disconnect: { id: category.id } },
                })
            }, ({ errors }) => {
                expect(errors[0].message).toMatch('null value in column "category" of relation "BankCostItem" violates not-null constraint')
                expect(errors).toMatchObject([{
                    name: 'GraphQLError',
                    path: ['obj'],
                }])
            })
        })
    })
})
