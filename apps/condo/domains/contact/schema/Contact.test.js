/**
 * Generated by `createschema contact.Contact 'property:Relationship:Property:SET_NULL; name:Text; phone:Text; unitName?:Text; email?:Text;'`
 */
const { faker } = require('@faker-js/faker')

const { catchErrorFrom, expectToThrowAuthenticationErrorToObjects, expectToThrowAccessDeniedErrorToObj, expectToThrowAuthenticationErrorToObj } = require('@open-condo/keystone/test.utils')
const { makeLoggedInAdminClient, makeClient, UUID_RE, DATETIME_RE } = require('@open-condo/keystone/test.utils')

const { PHONE_WRONG_FORMAT_ERROR } = require('@condo/domains/common/constants/errors')
const { Contact, createTestContact, updateTestContact } = require('@condo/domains/contact/utils/testSchema')
const { createTestOrganization } = require('@condo/domains/organization/utils/testSchema')
const { createTestOrganizationEmployeeRole } = require('@condo/domains/organization/utils/testSchema')
const { createTestOrganizationEmployee } = require('@condo/domains/organization/utils/testSchema')
const { FLAT_UNIT_TYPE, COMMERCIAL_UNIT_TYPE } = require('@condo/domains/property/constants/common')
const { makeClientWithProperty, createTestProperty } = require('@condo/domains/property/utils/testSchema')
const { createTestPhone, createTestEmail, makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')


describe('Contact', () => {
    test('required fields', async () => {
        const userClient = await makeClientWithProperty()
        const adminClient = await makeLoggedInAdminClient()
        const emptyFields = {
            email: null,
            unitName: null,
            unitType: null,
        }
        const [obj, attrs] = await createTestContact(adminClient, userClient.organization, userClient.property, emptyFields)
        expect(obj.id).toMatch(UUID_RE)
        expect(obj.dv).toEqual(1)
        expect(obj.sender).toEqual(attrs.sender)
        expect(obj.name).toMatch(attrs.name)
        expect(obj.phone).toMatch(attrs.phone)
        expect(obj.organization.id).toMatch(userClient.organization.id)
        expect(obj.v).toEqual(1)
        expect(obj.newId).toEqual(null)
        expect(obj.deletedAt).toEqual(null)
        expect(obj.createdBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
        expect(obj.updatedBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
        expect(obj.createdAt).toMatch(DATETIME_RE)
        expect(obj.updatedAt).toMatch(DATETIME_RE)
        expect(obj.email).toEqual(emptyFields.email)
        expect(obj.unitName).toEqual(emptyFields.unitName)
        expect(obj.unitType).toEqual(emptyFields.unitType)
        expect(obj.property).toEqual(expect.objectContaining({ id: userClient.property.id }))
    })

    describe('unique constraint', () => {
        it('throws error on create record with same set of fields: "property", "unitName", "phone"', async () => {
            const userClient = await makeClientWithProperty()
            const adminClient = await makeLoggedInAdminClient()
            const duplicatedFields = {
                property: { connect: { id: userClient.property.id } },
                unitName: faker.random.alphaNumeric(3),
                phone: createTestPhone(),
            }
            await createTestContact(adminClient, userClient.organization, userClient.property, duplicatedFields)

            await catchErrorFrom(async () => {
                await createTestContact(adminClient, userClient.organization, userClient.property, duplicatedFields)
            }, ({ errors, data }) => {
                expect(errors[0].message).toMatch('Cannot create contact, because another contact with the same provided set of "property", "unitName", "phone"')
                expect(data).toEqual({ 'obj': null })
            })
        })

        it('throws error on update record when another record exist with same set of fields: "property", "unitName", "phone"', async () => {
            const userClient = await makeClientWithProperty()
            const adminClient = await makeLoggedInAdminClient()
            const sameFields = {
                property: { connect: { id: userClient.property.id } },
                unitName: faker.random.alphaNumeric(3),
                phone: createTestPhone(),
            }

            await createTestContact(adminClient, userClient.organization, userClient.property, sameFields)
            const [contact] = await createTestContact(adminClient, userClient.organization, userClient.property, {
                property: { connect: { id: userClient.property.id } },
                unitName: faker.random.alphaNumeric(3),
                phone: createTestPhone(),
            })

            await catchErrorFrom(async () => {
                await updateTestContact(adminClient, contact.id, sameFields)
            }, ({ errors, data }) => {
                expect(errors[0].message).toMatch('Cannot update contact, because another contact with the same provided set of "property", "unitName", "phone"')
                expect(data).toEqual({ 'obj': null })
            })
        })
    })

    describe('validation', () => {
        test('name length should be min 1 character', async () => {
            const userClient = await makeClientWithProperty()
            const adminClient = await makeLoggedInAdminClient()
            await catchErrorFrom(async () => {
                await createTestContact(adminClient, userClient.organization, userClient.property, {
                    name: '',
                })
            }, ({ errors }) => {
                expect(errors[0].message).toMatch('You attempted to perform an invalid mutation')
                expect(errors[0].data.messages[0]).toMatch('Name should not be a blank string')
            })
        })

        it('phone should have correct format', async () => {
            const userClient = await makeClientWithProperty()
            const adminClient = await makeLoggedInAdminClient()
            const fields = {
                phone: '8 999 111-22-33',
            }
            await catchErrorFrom(async () => {
                await createTestContact(adminClient, userClient.organization, userClient.property, fields)
            }, ({ errors, data }) => {
                expect(errors[0].message).toMatch('You attempted to perform an invalid mutation')
                expect(errors[0].data.messages[0]).toMatch(`${PHONE_WRONG_FORMAT_ERROR}phone] invalid format`)
                expect(data.obj).toBeNull()
            })
        })

        describe('unitType and unitName', () => {
            let organization, property, admin

            beforeAll(async () => {
                admin = await makeLoggedInAdminClient();
                [organization] = await createTestOrganization(admin);
                [property] = await createTestProperty(admin, organization)
            })

            describe('create', () => {
                test('unitType must be reset if not pass unitName', async () => {
                    const [contact] = await createTestContact(admin, organization, property, {
                        unitType: COMMERCIAL_UNIT_TYPE,
                        unitName: null,
                    })
                    expect(contact).toHaveProperty('unitType', null)
                    expect(contact).toHaveProperty('unitName', null)
                })

                test('unitType must be set to default values if pass unitName and not pass unitType', async () => {
                    const [contact, attrs] = await createTestContact(admin, organization, property, {
                        unitType: null,
                        unitName: faker.random.alphaNumeric(5),
                    })
                    expect(contact).toHaveProperty('unitType', FLAT_UNIT_TYPE)
                    expect(contact).toHaveProperty('unitName', attrs.unitName)
                })

                test('unitType and unitName must be empty if they were not passed', async () => {
                    const [contact] = await createTestContact(admin, organization, property, {
                        unitType: null,
                        unitName: null,
                    })
                    expect(contact).toHaveProperty('unitType', null)
                    expect(contact).toHaveProperty('unitName', null)
                })

                test('unitType and unitName must not be empty if they were passed', async () => {
                    const [contact, attrs] = await createTestContact(admin, organization, property, {
                        unitType: COMMERCIAL_UNIT_TYPE,
                        unitName: faker.random.alphaNumeric(5),
                    })
                    expect(contact).toHaveProperty('unitType', COMMERCIAL_UNIT_TYPE)
                    expect(contact).toHaveProperty('unitName', attrs.unitName)
                })
            })

            describe('update', () => {
                test('unitType must not be update if unitName is not null and unitType try update to null', async () => {
                    const [contact] = await createTestContact(admin, organization, property, { unitType: COMMERCIAL_UNIT_TYPE })
                    expect(contact).toHaveProperty('unitType', COMMERCIAL_UNIT_TYPE)
                    const [updatedContact] = await updateTestContact(admin, contact.id, {
                        unitType: null,
                    })
                    expect(updatedContact).toHaveProperty('unitType', COMMERCIAL_UNIT_TYPE)
                    expect(updatedContact).toHaveProperty('unitName', contact.unitName)
                })

                test('unitType must be set null if unitType is not null and unitName update to null', async () => {
                    const [contact] = await createTestContact(admin, organization, property, { unitType: COMMERCIAL_UNIT_TYPE })
                    const [updatedContact] = await updateTestContact(admin, contact.id, {
                        unitName: null,
                    })
                    expect(updatedContact).toHaveProperty('unitType', null)
                    expect(updatedContact).toHaveProperty('unitName', null)
                })

                test('unitType and unitName must be set null if unitType and unitName update to null', async () => {
                    const [contact] = await createTestContact(admin, organization, property, { unitType: COMMERCIAL_UNIT_TYPE })
                    const [updatedContact] = await updateTestContact(admin, contact.id, {
                        unitType: null,
                        unitName: null,
                    })
                    expect(updatedContact).toHaveProperty('unitType', null)
                    expect(updatedContact).toHaveProperty('unitName', null)
                })

                test('unitType must be updatable', async () => {
                    const [contact] = await createTestContact(admin, organization, property, { unitType: FLAT_UNIT_TYPE })
                    const [updatedContact] = await updateTestContact(admin, contact.id, {
                        unitType: COMMERCIAL_UNIT_TYPE,
                    })
                    expect(updatedContact).toHaveProperty('unitType', COMMERCIAL_UNIT_TYPE)
                    expect(updatedContact).toHaveProperty('unitName', contact.unitName)
                })

                test('unitName must be updatable', async () => {
                    const [contact] = await createTestContact(admin, organization, property, { unitType: COMMERCIAL_UNIT_TYPE })
                    const [updatedContact, attrs] = await updateTestContact(admin, contact.id, {
                        unitName: faker.random.alphaNumeric(5),
                    })
                    expect(updatedContact).toHaveProperty('unitType', COMMERCIAL_UNIT_TYPE)
                    expect(updatedContact).toHaveProperty('unitName', attrs.unitName)
                })
            })
        })

        describe('ownershipPercentage field', () => {
            it('can be positive number below 100', async () => {
                const userClient = await makeClientWithProperty()
                const adminClient = await makeLoggedInAdminClient()
                const fields = {
                    ownershipPercentage: '42',
                }

                const [obj, attrs] = await createTestContact(adminClient, userClient.organization, userClient.property, fields)

                expect(obj.id).toMatch(UUID_RE)
                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.ownershipPercentage).toEqual('42.00000000')
            })

            it('can be decimal positive number below 100', async () => {
                const userClient = await makeClientWithProperty()
                const adminClient = await makeLoggedInAdminClient()
                const fields = {
                    ownershipPercentage: '32.14',
                }

                const [obj, attrs] = await createTestContact(adminClient, userClient.organization, userClient.property, fields)

                expect(obj.id).toMatch(UUID_RE)
                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.ownershipPercentage).toEqual('32.14000000')
            })

            it('can be 0', async () => {
                const userClient = await makeClientWithProperty()
                const adminClient = await makeLoggedInAdminClient()
                const fields = {
                    ownershipPercentage: '0',
                }

                const [obj, attrs] = await createTestContact(adminClient, userClient.organization, userClient.property, fields)

                expect(obj.id).toMatch(UUID_RE)
                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.ownershipPercentage).toEqual('0.00000000')
            })

            it('can be 100', async () => {
                const userClient = await makeClientWithProperty()
                const adminClient = await makeLoggedInAdminClient()
                const fields = {
                    ownershipPercentage: '100',
                }

                const [obj, attrs] = await createTestContact(adminClient, userClient.organization, userClient.property, fields)

                expect(obj.id).toMatch(UUID_RE)
                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.ownershipPercentage).toEqual('100.00000000')
            })

            it('cannot be less then 0', async () => {
                const userClient = await makeClientWithProperty()
                const adminClient = await makeLoggedInAdminClient()

                const fields = {
                    ownershipPercentage: '-10',
                }

                await catchErrorFrom(async () => {
                    await createTestContact(adminClient, userClient.organization, userClient.property, fields)
                }, ({ errors, data }) => {
                    expect(errors[0].message).toMatch('You attempted to perform an invalid mutation')
                    expect(errors[0].data.messages[0]).toMatch('ownershipPercentage should be a positive number below 100')
                    expect(data.obj).toBeNull()
                })

                const [obj, attrs] = await createTestContact(adminClient, userClient.organization, userClient.property)

                await catchErrorFrom(async () => {
                    await updateTestContact(adminClient, obj.id, fields)
                }, ({ errors, data }) => {
                    expect(errors[0].message).toMatch('You attempted to perform an invalid mutation')
                    expect(errors[0].data.messages[0]).toMatch('ownershipPercentage should be a positive number below 100')
                    expect(data.obj).toBeNull()
                })
            })

            it('cannot be greater then 100', async () => {
                const userClient = await makeClientWithProperty()
                const adminClient = await makeLoggedInAdminClient()
                const fields = {
                    ownershipPercentage: '100.01',
                }

                await catchErrorFrom(async () => {
                    await createTestContact(adminClient, userClient.organization, userClient.property, fields)
                }, ({ errors, data }) => {
                    expect(errors[0].message).toMatch('You attempted to perform an invalid mutation')
                    expect(errors[0].data.messages[0]).toMatch('ownershipPercentage should be a positive number below 100')
                    expect(data.obj).toBeNull()
                })

                const [obj, attrs] = await createTestContact(adminClient, userClient.organization, userClient.property)

                await catchErrorFrom(async () => {
                    await updateTestContact(adminClient, obj.id, fields)
                }, ({ errors, data }) => {
                    expect(errors[0].message).toMatch('You attempted to perform an invalid mutation')
                    expect(errors[0].data.messages[0]).toMatch('ownershipPercentage should be a positive number below 100')
                    expect(data.obj).toBeNull()
                })
            })
        })
    })

    describe('normalization', () => {
        it('converts phone to E.164 format without spaces', async () => {
            const userClient = await makeClientWithProperty()
            const adminClient = await makeLoggedInAdminClient()
            const fields = {
                phone: '+7 999 111-22-33',
            }
            const [obj] = await createTestContact(adminClient, userClient.organization, userClient.property, fields)
            expect(obj.phone).toEqual('+79991112233')
        })

        it('converts email to lowercase format', async () => {
            const userClient = await makeClientWithProperty()
            const adminClient = await makeLoggedInAdminClient()
            const fields = {
                email: 'Test@Example.com',
            }
            const [obj] = await createTestContact(adminClient, userClient.organization, userClient.property, fields)
            expect(obj.email).toEqual('test@example.com')
        })
    })

    describe('Create', () => {
        it('can be created by admin', async () => {
            const userClient = await makeClientWithProperty()
            const adminClient = await makeLoggedInAdminClient()
            const [obj, attrs] = await createTestContact(adminClient, userClient.organization, userClient.property)

            expect(obj.id).toMatch(UUID_RE)
            expect(obj.dv).toEqual(1)
            expect(obj.sender).toEqual(attrs.sender)
            expect(obj.unitName).toMatch(attrs.unitName)
            expect(obj.unitType).toMatch(FLAT_UNIT_TYPE)
            expect(obj.name).toMatch(attrs.name)
            expect(obj.phone).toMatch(attrs.phone)
            expect(obj.email).toMatch(attrs.email)
            expect(obj.organization.id).toMatch(userClient.organization.id)
            expect(obj.v).toEqual(1)
            expect(obj.newId).toEqual(null)
            expect(obj.deletedAt).toEqual(null)
            expect(obj.createdBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
            expect(obj.updatedBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
            expect(obj.createdAt).toMatch(DATETIME_RE)
            expect(obj.updatedAt).toMatch(DATETIME_RE)
        })

        it('can be created by user, who is employed in the same organization and has "canManageContacts" ability', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const userClient = await makeClientWithProperty()
            const [organization] = await createTestOrganization(adminClient)
            const [role] = await createTestOrganizationEmployeeRole(adminClient, organization, {
                canManageContacts: true,
            })
            await createTestOrganizationEmployee(adminClient, organization, userClient.user, role)

            const [obj, attrs] = await createTestContact(userClient, organization, userClient.property)

            expect(obj.id).toMatch(UUID_RE)
            expect(obj.dv).toEqual(1)
            expect(obj.sender).toEqual(attrs.sender)
            expect(obj.unitName).toMatch(attrs.unitName)
            expect(obj.unitType).toMatch(FLAT_UNIT_TYPE)
            expect(obj.name).toMatch(attrs.name)
            expect(obj.phone).toMatch(attrs.phone)
            expect(obj.email).toMatch(attrs.email)
            expect(obj.organization.id).toMatch(organization.id)
            expect(obj.v).toEqual(1)
            expect(obj.newId).toEqual(null)
            expect(obj.deletedAt).toEqual(null)
            expect(obj.createdBy).toEqual(expect.objectContaining({ id: userClient.user.id }))
            expect(obj.updatedBy).toEqual(expect.objectContaining({ id: userClient.user.id }))
            expect(obj.createdAt).toMatch(DATETIME_RE)
            expect(obj.updatedAt).toMatch(DATETIME_RE)
        })

        it('cannot be created by user, who is employed in the same organization and does not have "canManageContacts" ability', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const userClient = await makeClientWithProperty()
            const [organization] = await createTestOrganization(adminClient)
            const [anotherOrganization] = await createTestOrganization(adminClient)
            const [role] = await createTestOrganizationEmployeeRole(adminClient, organization, {
                canManageContacts: false,
            })
            await createTestOrganizationEmployee(adminClient, organization, userClient.user, role)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestContact(userClient, anotherOrganization, userClient.property)
            })
        })

        it('cannot be created by user, who is not employed in specified organization', async () => {
            const user = await makeClientWithProperty()
            const anotherUser = await makeClientWithProperty()
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestContact(anotherUser, user.organization, user.property)
            })
        })

        it('cannot be created by anonymous', async () => {
            const userClient = await makeClientWithProperty()
            const anonymous = await makeClient()
            await expectToThrowAuthenticationErrorToObj(async () => {
                await createTestContact(anonymous, userClient.organization, userClient.property)
            })
        })
    })

    describe('Read', () => {
        it('can be read by admin', async () => {
            const userClient = await makeClientWithProperty()
            const admin = await makeLoggedInAdminClient()
            const [obj, attrs] = await createTestContact(admin, userClient.organization, userClient.property)
            const objs = await Contact.getAll(admin, {}, { sortBy: ['updatedAt_DESC'] })
            expect(objs.length).toBeGreaterThanOrEqual(1)
            expect(objs).toEqual(expect.arrayContaining([
                expect.objectContaining({
                    id: obj.id,
                    sender: attrs.sender,
                    createdBy: expect.objectContaining({ id: admin.user.id }),
                    updatedBy: expect.objectContaining({ id: admin.user.id }),
                    createdAt: obj.createdAt,
                    updatedAt: obj.updatedAt,
                    name: attrs.name,
                    phone: attrs.phone,
                    email: attrs.email,
                }),
            ]))
        })

        it('can be read by user, who is employed in organization, which manages associated property', async () => {
            const userClient = await makeClientWithProperty()
            const adminClient = await makeLoggedInAdminClient()
            const [obj] = await createTestContact(adminClient, userClient.organization, userClient.property)
            const objs = await Contact.getAll(userClient, {}, { sortBy: ['updatedAt_DESC'] })
            expect(objs).toHaveLength(1)
            expect(objs[0].id).toMatch(obj.id)
        })

        it('cannot be read by employee with canReadContacts: false', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
            const [organization] = await createTestOrganization(adminClient)
            const [role] = await createTestOrganizationEmployeeRole(adminClient, organization, { canReadContacts: false })
            await createTestOrganizationEmployee(adminClient, organization, userClient.user, role)
            const [property] = await createTestProperty(adminClient, organization)
            const [obj] = await createTestContact(adminClient, organization, property)

            const readContact = await Contact.getOne(userClient, { id: obj.id })

            expect(readContact).toBeUndefined()
        })

        it('cannot be read by user, who is not employed in organization, which manages associated property', async () => {
            const userClient = await makeClientWithProperty()
            const anotherUserClient = await makeClientWithProperty()
            const adminClient = await makeLoggedInAdminClient()
            const [obj] = await createTestContact(adminClient, userClient.organization, userClient.property)
            await createTestContact(adminClient, anotherUserClient.organization, userClient.property)
            const objs = await Contact.getAll(userClient, {}, { sortBy: ['updatedAt_DESC'] })
            expect(objs).toHaveLength(1)
            expect(objs[0].id).toMatch(obj.id)
        })

        it('cannot be read by anonymous', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const userClient = await makeClientWithProperty()
            const anonymousClient = await makeClient()
            await createTestContact(adminClient, userClient.organization, userClient.property)
            await expectToThrowAuthenticationErrorToObjects(async () => {
                await Contact.getAll(anonymousClient)
            })
        })
    })

    describe('Update', () => {
        it('can be updated by admin', async () => {
            const userClient = await makeClientWithProperty()
            const adminClient = await makeLoggedInAdminClient()
            const [obj] = await createTestContact(adminClient, userClient.organization, userClient.property)

            const [objUpdated, attrs] = await updateTestContact(adminClient, obj.id, {
                name: faker.name.firstName(),
                email: createTestEmail(),
                phone: createTestPhone(),
            })

            expect(objUpdated.id).toEqual(obj.id)
            expect(objUpdated.dv).toEqual(1)
            expect(objUpdated.sender).toEqual(attrs.sender)
            expect(objUpdated.v).toEqual(2)
            expect(objUpdated.newId).toEqual(null)
            expect(objUpdated.deletedAt).toEqual(null)
            expect(objUpdated.createdBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
            expect(objUpdated.updatedBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
            expect(objUpdated.createdAt).toMatch(DATETIME_RE)
            expect(objUpdated.updatedAt).toMatch(DATETIME_RE)
            expect(objUpdated.updatedAt).not.toEqual(objUpdated.createdAt)
            expect(objUpdated.name).toEqual(attrs.name)
            expect(objUpdated.email).toEqual(attrs.email)
            expect(objUpdated.phone).toEqual(attrs.phone)
        })

        it('can be updated by user, who is employed in the same organization and does have "canManageContacts" ability', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const userClient = await makeClientWithProperty()
            const [organization] = await createTestOrganization(adminClient)
            const [role] = await createTestOrganizationEmployeeRole(adminClient, organization, {
                canManageContacts: true,
            })
            await createTestOrganizationEmployee(adminClient, organization, userClient.user, role)

            const [obj] = await createTestContact(adminClient, organization, userClient.property)

            const [objUpdated, attrs] = await updateTestContact(userClient, obj.id, {
                name: faker.name.firstName(),
                email: createTestEmail(),
                phone: createTestPhone(),
            })

            expect(objUpdated.id).toEqual(obj.id)
            expect(objUpdated.dv).toEqual(1)
            expect(objUpdated.sender).toEqual(attrs.sender)
            expect(objUpdated.v).toEqual(2)
            expect(objUpdated.newId).toEqual(null)
            expect(objUpdated.deletedAt).toEqual(null)
            expect(objUpdated.createdBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
            expect(objUpdated.updatedBy).toEqual(expect.objectContaining({ id: userClient.user.id }))
            expect(objUpdated.createdAt).toMatch(DATETIME_RE)
            expect(objUpdated.updatedAt).toMatch(DATETIME_RE)
            expect(objUpdated.updatedAt).not.toEqual(objUpdated.createdAt)
            expect(objUpdated.name).toEqual(attrs.name)
            expect(objUpdated.email).toEqual(attrs.email)
            expect(objUpdated.phone).toEqual(attrs.phone)
        })

        it('cannot be updated by user, who is employed in organization and does not have "canManageContacts" ability', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const userClient = await makeClientWithProperty()
            const [organization] = await createTestOrganization(adminClient)
            const [role] = await createTestOrganizationEmployeeRole(adminClient, organization, {
                canManageContacts: false,
            })
            await createTestOrganizationEmployee(adminClient, organization, userClient.user, role)

            const [obj] = await createTestContact(adminClient, organization, userClient.property)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestContact(userClient, obj.id)
            })
        })

        it('cannot be updated by user, who is not employed in organization, which manages associated property', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const userClient = await makeClientWithProperty()
            const [organization] = await createTestOrganization(adminClient)
            const [role] = await createTestOrganizationEmployeeRole(adminClient, organization, {
                canManageContacts: true,
            })
            await createTestOrganizationEmployee(adminClient, organization, userClient.user, role)

            const anotherUserClient = await makeClientWithProperty()

            const [obj] = await createTestContact(adminClient, organization, userClient.property)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestContact(anotherUserClient, obj.id)
            })
        })

        it('cannot be updated by anonymous', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const userClient = await makeClientWithProperty()
            const anonymousClient = await makeClient()

            const [obj] = await createTestContact(adminClient, userClient.organization, userClient.property)

            await expectToThrowAuthenticationErrorToObj(async () => {
                await updateTestContact(anonymousClient, obj.id)
            })
        })
    })

    describe('Delete', () => {
        it('cannot be deleted by admin', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const userClient = await makeClientWithProperty()

            const [obj] = await createTestContact(adminClient, userClient.organization, userClient.property)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await Contact.delete(adminClient, obj.id)
            })
        })

        it('cannot be deleted by user', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const userClient = await makeClientWithProperty()

            const [obj] = await createTestContact(adminClient, userClient.organization, userClient.property)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await Contact.delete(userClient, obj.id)
            })
        })

        it('cannot be deleted by anonymous', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const userClient = await makeClientWithProperty()
            const anonymousClient = await makeClient()

            const [obj] = await createTestContact(adminClient, userClient.organization, userClient.property)
            // TODO: is this really authorization error and not authentification
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await Contact.delete(anonymousClient, obj.id)
            })
        })
    })

    describe('SoftDelete', () => {
        it('can be soft deleted by admin', async () => {
            const userClient = await makeClientWithProperty()
            const adminClient = await makeLoggedInAdminClient()
            const [obj] = await createTestContact(adminClient, userClient.organization, userClient.property)

            const [softDeletedObj, attrs] = await Contact.softDelete(adminClient, obj.id)

            expect(softDeletedObj.id).toEqual(obj.id)
            expect(softDeletedObj.dv).toEqual(1)
            expect(softDeletedObj.sender).toEqual(attrs.sender)
            expect(softDeletedObj.v).toEqual(2)
            expect(softDeletedObj.newId).toEqual(null)
            expect(softDeletedObj.deletedAt).not.toBeNull()
            expect(softDeletedObj.createdBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
            expect(softDeletedObj.updatedBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
            expect(softDeletedObj.createdAt).toMatch(DATETIME_RE)
            expect(softDeletedObj.updatedAt).toMatch(DATETIME_RE)
            expect(softDeletedObj.updatedAt).not.toEqual(softDeletedObj.createdAt)
            expect(softDeletedObj.name).toEqual(obj.name)
            expect(softDeletedObj.email).toEqual(obj.email)
            expect(softDeletedObj.phone).toEqual(obj.phone)
        })

        it('can be soft deleted with canManageContact access rights', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const userClient = await makeClientWithProperty()
            const [organization] = await createTestOrganization(adminClient)
            const [role] = await createTestOrganizationEmployeeRole(adminClient, organization, {
                canManageContacts: true,
            })
            await createTestOrganizationEmployee(adminClient, organization, userClient.user, role)
            const [contact] = await createTestContact(adminClient, userClient.organization, userClient.property)

            const [softDeletedObj, attrs] = await Contact.softDelete(userClient, contact.id)

            expect(softDeletedObj.id).toEqual(contact.id)
            expect(softDeletedObj.dv).toEqual(1)
            expect(softDeletedObj.sender).toEqual(attrs.sender)
            expect(softDeletedObj.v).toEqual(2)
            expect(softDeletedObj.newId).toEqual(null)
            expect(softDeletedObj.deletedAt).not.toBeNull()
            expect(softDeletedObj.createdBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
            expect(softDeletedObj.updatedBy).toEqual(expect.objectContaining({ id: userClient.user.id }))
            expect(softDeletedObj.createdAt).toMatch(DATETIME_RE)
            expect(softDeletedObj.updatedAt).toMatch(DATETIME_RE)
            expect(softDeletedObj.updatedAt).not.toEqual(softDeletedObj.createdAt)
            expect(softDeletedObj.name).toEqual(contact.name)
            expect(softDeletedObj.email).toEqual(contact.email)
            expect(softDeletedObj.phone).toEqual(contact.phone)
        })

        it('Can create same contact after softDeletion', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const userClient = await makeClientWithProperty()
            const [organization] = await createTestOrganization(adminClient)
            const [role] = await createTestOrganizationEmployeeRole(adminClient, organization, {
                canManageContacts: true,
            })
            await createTestOrganizationEmployee(adminClient, organization, userClient.user, role)
            const [contact] = await createTestContact(adminClient, userClient.organization, userClient.property)

            await Contact.softDelete(userClient, contact.id)
            const [newContact] = await createTestContact(adminClient, userClient.organization, userClient.property, {
                unitName: contact.unitName,
                unitType: contact.unitType,
                name: contact.name,
                phone: contact.phone,
                email: contact.email,
            })
            expect(newContact).toHaveProperty(['organization', 'id'], contact.organization.id)
            expect(newContact).toHaveProperty(['property', 'id'], contact.property.id)
            expect(newContact).toHaveProperty(['unitName'], contact.unitName)
            expect(newContact).toHaveProperty(['unitType'], contact.unitType)
            expect(newContact).toHaveProperty(['name'], contact.name)
            expect(newContact).toHaveProperty(['phone'], contact.phone)
            expect(newContact).toHaveProperty(['email'], contact.email)
            expect(newContact.id).not.toEqual(contact.id)

            await Contact.softDelete(userClient, newContact.id)

            const [newestContact] = await createTestContact(adminClient, userClient.organization, userClient.property, {
                unitName: contact.unitName,
                unitType: contact.unitType,
                name: contact.name,
                phone: contact.phone,
                email: contact.email,
            })
            expect(newestContact).toHaveProperty(['organization', 'id'], contact.organization.id)
            expect(newestContact).toHaveProperty(['property', 'id'], contact.property.id)
            expect(newestContact).toHaveProperty(['unitName'], contact.unitName)
            expect(newestContact).toHaveProperty(['unitType'], contact.unitType)
            expect(newestContact).toHaveProperty(['name'], contact.name)
            expect(newestContact).toHaveProperty(['phone'], contact.phone)
            expect(newestContact).toHaveProperty(['email'], contact.email)
            expect(newestContact.id).not.toEqual(contact.id)
            expect(newestContact.id).not.toEqual(newContact.id)
        })

        it('cannot be soft deleted by user from another organization', async () => {
            const userClient = await makeClientWithProperty()
            const adminClient = await makeLoggedInAdminClient()
            const [obj] = await createTestContact(adminClient, userClient.organization, userClient.property)
            const anotherUserClient = await makeClientWithProperty()

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await Contact.softDelete(anotherUserClient, obj.id)
            })
        })
    })
})
