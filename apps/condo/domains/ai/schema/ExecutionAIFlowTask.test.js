/**
 * Generated by `createschema ai.ExecutionAIFlowTask 'flowType:Text; context:Json; status:Select:processing,completed,error,canceled; result?:Json; errorMessage?:Text; error?:Json; meta?:Json; locale:Text; generationId?:Text; user:Relationship:User:SET_NULL;'`
 */

const { faker } = require('@faker-js/faker')

const {
    makeLoggedInAdminClient,
    makeClient,
    UUID_RE,
    DATETIME_RE,
    expectToThrowGQLError,
    waitFor,
    expectToThrowAuthenticationErrorToObj,
    expectToThrowAuthenticationErrorToObjects,
    expectToThrowAccessDeniedErrorToObj,
    initTestExpressApp,
} = require('@open-condo/keystone/test.utils')

const { TASK_STATUSES } = require('@condo/domains/ai/constants')
const { removeSensitiveDataFromObj } = require('@condo/domains/ai/utils/serverSchema/removeSensitiveDataFromObj')
const {
    ExecutionAIFlowTask,
    ExecutionAIFlowTaskForUser,
    createTestExecutionAIFlowTask,
    updateTestExecutionAIFlowTask,
} = require('@condo/domains/ai/utils/testSchema')
const {
    FlowiseTestingApp,
    FAULTY_FLOWISE_PREDICTION_RESULT,
    SUCCESS_FLOWISE_PREDICTION_RESULT,
} = require('@condo/domains/ai/utils/testSchema/AIFlowTestingApps/FlowiseTestingApp')
const {
    makeClientWithNewRegisteredAndLoggedInUser,
    makeClientWithSupportUser,
} = require('@condo/domains/user/utils/testSchema')


describe('ExecutionAIFlowTask', () => {
    let adminClient, supportClient, userClient, userClient2, anonymousClient

    // In envs the full url is specified, so we must specify the port
    initTestExpressApp('Flowise', new FlowiseTestingApp().prepareMiddleware(), 'http', 57657, { useDanglingMode: true })

    beforeAll(async () => {
        adminClient = await makeLoggedInAdminClient()
        supportClient = await makeClientWithSupportUser()
        anonymousClient = await makeClient()
    })

    beforeEach(async () => {
        userClient = await makeClientWithNewRegisteredAndLoggedInUser()
        userClient2 = await makeClientWithNewRegisteredAndLoggedInUser()
    })

    describe('Accesses', () => {
        describe('Admin', () => {
            test('Can create for any user', async () => {
                const [task, taskAttrs] = await createTestExecutionAIFlowTask(adminClient, userClient.user, {
                    flowType: 'success_flow',
                    context: { some_field: faker.lorem.words(3) },
                })
                expect(task.id).toMatch(UUID_RE)
                expect(task.v).toEqual(1)
                expect(task.deletedAt).toBeNull()
                expect(task.createdBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
                expect(task.updatedBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
                expect(task.createdAt).toMatch(DATETIME_RE)
                expect(task.updatedAt).toMatch(DATETIME_RE)
                expect(task.user.id).toEqual(userClient.user.id)
                expect(task.status).toEqual(TASK_STATUSES.PROCESSING)
                expect(task.flowType).toEqual(taskAttrs.flowType)
                expect(task.context).toEqual(taskAttrs.context)
                expect(task.result).toBeNull()
                expect(task.errorMessage).toBeNull()
            })

            test('Can read any tasks', async () => {
                const [createdTask] = await createTestExecutionAIFlowTask(adminClient, userClient.user, {
                    flowType: 'success_flow',
                    context: { some_field: faker.lorem.words(3) },
                })
                const task = await ExecutionAIFlowTask.getOne(adminClient, { id: createdTask.id })
                expect(task.id).toBe(createdTask.id)
            })

            test('Can update any tasks', async () => {
                const [createdTask] = await createTestExecutionAIFlowTask(adminClient, userClient.user, {
                    flowType: 'success_flow',
                    context: { some_field: faker.lorem.words(3) },
                })
                // NOTE: we cannot guarantee that the task has been cancelled
                // because the task completion may happen very quickly before we send the task cancellation request
                await waitFor(async () => {
                    const foundTask = await ExecutionAIFlowTask.getOne(adminClient, { id: createdTask.id })
                    expect(foundTask.status).toBe(TASK_STATUSES.COMPLETED)
                })
                await expectToThrowGQLError(async () => {
                    await updateTestExecutionAIFlowTask(adminClient, createdTask.id, {
                        status: TASK_STATUSES.CANCELLED,
                    })
                }, {
                    code: 'BAD_USER_INPUT',
                    type: 'WRONG_VALUE',
                    message: 'Status is already completed',
                })
            })

            test('Can soft delete any tasks', async () => {
                const [createdTask] = await createTestExecutionAIFlowTask(adminClient, userClient.user, {
                    flowType: 'success_flow',
                    context: { some_field: faker.lorem.words(3) },
                })
                const [deletedTask] = await ExecutionAIFlowTask.softDelete(adminClient, createdTask.id)
                expect(deletedTask.id).toEqual(createdTask.id)
                expect(deletedTask.deletedAt).not.toBeNull()
                expect(deletedTask.deletedAt).toMatch(DATETIME_RE)
            })
        })

        describe('Support', () => {
            test('Can create for self only', async () => {
                const [task] = await createTestExecutionAIFlowTask(supportClient, supportClient.user, {
                    flowType: 'success_flow',
                    context: { some_field: faker.lorem.words(3) },
                })
                expect(task.user.id).toEqual(supportClient.user.id)
            })

            test('Cannot create for other user', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestExecutionAIFlowTask(supportClient, userClient.user, {
                        flowType: 'success_flow',
                        context: { some_field: faker.lorem.words(3) },
                    })
                })
            })

            test('Can read any tasks', async () => {
                const [selfTask] = await createTestExecutionAIFlowTask(supportClient, supportClient.user, {
                    flowType: 'success_flow',
                    context: { some_field: faker.lorem.words(3) },
                })
                const [otherTask] = await createTestExecutionAIFlowTask(adminClient, userClient.user, {
                    flowType: 'success_flow',
                    context: { some_field: faker.lorem.words(3) },
                })
                const tasks = await ExecutionAIFlowTask.getAll(supportClient, { id_in: [selfTask.id, otherTask.id] })
                expect(tasks).toHaveLength(2)
                expect(tasks).toEqual(expect.arrayContaining([
                    expect.objectContaining({ id: selfTask.id }),
                    expect.objectContaining({ id: otherTask.id }),
                ]))
            })

            test('Can update self tasks only', async () => {
                const [selfTask] = await createTestExecutionAIFlowTask(supportClient, supportClient.user, {
                    flowType: 'success_flow',
                    context: { some_field: faker.lorem.words(3) },
                })

                // NOTE: we cannot guarantee that the task has been cancelled
                // because the task completion may happen very quickly before we send the task cancellation request
                await waitFor(async () => {
                    const foundTask = await ExecutionAIFlowTask.getOne(adminClient, { id: selfTask.id })
                    expect(foundTask.status).toBe(TASK_STATUSES.COMPLETED)
                })
                await expectToThrowGQLError(async () => {
                    await updateTestExecutionAIFlowTask(supportClient, selfTask.id, {
                        status: TASK_STATUSES.CANCELLED,
                    })
                }, {
                    code: 'BAD_USER_INPUT',
                    type: 'WRONG_VALUE',
                    message: 'Status is already completed',
                })
            })

            test('Cannot update tasks for other users', async () => {
                const [otherTask] = await createTestExecutionAIFlowTask(adminClient, userClient.user, {
                    flowType: 'success_flow',
                    context: { some_field: faker.lorem.words(3) },
                })

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestExecutionAIFlowTask(supportClient, otherTask.id, {
                        status: TASK_STATUSES.CANCELLED,
                    })
                })
            })

            test('Cannot soft delete tasks', async () => {
                const [selfTask] = await createTestExecutionAIFlowTask(supportClient, supportClient.user, {
                    flowType: 'success_flow',
                    context: { some_field: faker.lorem.words(3) },
                })
                const [otherTask] = await createTestExecutionAIFlowTask(adminClient, userClient.user, {
                    flowType: 'success_flow',
                    context: { some_field: faker.lorem.words(3) },
                })

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await ExecutionAIFlowTask.softDelete(supportClient, selfTask.id)
                })
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await ExecutionAIFlowTask.softDelete(supportClient, otherTask.id)
                })
            })
        })

        describe('User', () => {
            test('Can create for self only', async () => {
                const selfTask = await ExecutionAIFlowTaskForUser.create(userClient, {
                    user: { connect: { id: userClient.user.id } },
                    flowType: 'success_flow',
                    context: { some_field: faker.lorem.words(3) },
                    dv: 1,
                    sender: { fingerprint: faker.random.alphaNumeric(8), dv: 1 },
                })
                expect(selfTask.user.id).toEqual(userClient.user.id)
            })

            test('Cannot create for other user', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestExecutionAIFlowTask(userClient, userClient2.user, {
                        flowType: 'success_flow',
                        context: { some_field: faker.lorem.words(3) },
                    })
                })
            })

            test('Can read self tasks only', async () => {
                const selfTask = await ExecutionAIFlowTaskForUser.create(userClient, {
                    user: { connect: { id: userClient.user.id } },
                    flowType: 'success_flow',
                    context: { some_field: faker.lorem.words(3) },
                    dv: 1,
                    sender: { fingerprint: faker.random.alphaNumeric(8), dv: 1 },
                })
                const otherTask = await ExecutionAIFlowTaskForUser.create(adminClient, {
                    user: { connect: { id: userClient2.user.id } },
                    flowType: 'success_flow',
                    context: { some_field: faker.lorem.words(3) },
                    dv: 1,
                    sender: { fingerprint: faker.random.alphaNumeric(8), dv: 1 },
                })
                const tasks = await ExecutionAIFlowTaskForUser.getAll(userClient, { id_in: [selfTask.id, otherTask.id] })
                expect(tasks).toHaveLength(1)
                expect(tasks).toEqual(expect.arrayContaining([
                    expect.objectContaining({ id: selfTask.id }),
                ]))
            })

            test('Can update self tasks only', async () => {
                const selfTask = await ExecutionAIFlowTaskForUser.create(userClient, {
                    user: { connect: { id: userClient.user.id } },
                    flowType: 'success_flow',
                    context: { some_field: faker.lorem.words(3) },
                    dv: 1,
                    sender: { fingerprint: faker.random.alphaNumeric(8), dv: 1 },
                })

                // NOTE: we cannot guarantee that the task has been cancelled
                // because the task completion may happen very quickly before we send the task cancellation request
                await waitFor(async () => {
                    const foundTask = await ExecutionAIFlowTask.getOne(adminClient, { id: selfTask.id })
                    expect(foundTask.status).toBe(TASK_STATUSES.COMPLETED)
                })
                await expectToThrowGQLError(async () => {
                    await ExecutionAIFlowTaskForUser.update(userClient, selfTask.id, {
                        status: TASK_STATUSES.CANCELLED,
                        dv: 1,
                        sender: { fingerprint: faker.random.alphaNumeric(8), dv: 1 },
                    })
                }, {
                    code: 'BAD_USER_INPUT',
                    type: 'WRONG_VALUE',
                    message: 'Status is already completed',
                })
            })

            test('Cannot update tasks for other users', async () => {
                const [otherTask] = await createTestExecutionAIFlowTask(adminClient, userClient2.user, {
                    flowType: 'success_flow',
                    context: { some_field: faker.lorem.words(3) },
                })

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestExecutionAIFlowTask(userClient, otherTask.id, {
                        status: TASK_STATUSES.CANCELLED,
                    })
                })
            })

            test('Cannot soft delete tasks', async () => {
                const selfTask = await ExecutionAIFlowTaskForUser.create(userClient, {
                    user: { connect: { id: userClient.user.id } },
                    flowType: 'success_flow',
                    context: { some_field: faker.lorem.words(3) },
                    dv: 1,
                    sender: { fingerprint: faker.random.alphaNumeric(8), dv: 1 },
                })
                const otherTask = await ExecutionAIFlowTaskForUser.create(adminClient, {
                    user: { connect: { id: userClient2.user.id } },
                    flowType: 'success_flow',
                    context: { some_field: faker.lorem.words(3) },
                    dv: 1,
                    sender: { fingerprint: faker.random.alphaNumeric(8), dv: 1 },
                })

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await ExecutionAIFlowTaskForUser.softDelete(supportClient, selfTask.id)
                })
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await ExecutionAIFlowTaskForUser.softDelete(supportClient, otherTask.id)
                })
            })
        })

        describe('Anonymous', () => {
            test('Cannot create for any user', async () => {
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await createTestExecutionAIFlowTask(anonymousClient, userClient.user, {
                        flowType: 'success_flow',
                        context: { some_field: faker.lorem.words(3) },
                    })
                })
            })

            test('Cannot read', async () => {
                const [task] = await createTestExecutionAIFlowTask(adminClient, userClient.user, {
                    flowType: 'success_flow',
                    context: { some_field: faker.lorem.words(3) },
                })
                await expectToThrowAuthenticationErrorToObjects(async () => {
                    await ExecutionAIFlowTask.getAll(anonymousClient, { id_in: [task.id] })
                })
            })

            test('Cannot update', async () => {
                const [task] = await createTestExecutionAIFlowTask(adminClient, userClient.user, {
                    flowType: 'success_flow',
                    context: { some_field: faker.lorem.words(3) },
                })
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTestExecutionAIFlowTask(anonymousClient, task.id, {
                        status: TASK_STATUSES.CANCELLED,
                    })
                })
            })

            test('Cannot soft delete', async () => {
                const [task] = await createTestExecutionAIFlowTask(adminClient, userClient.user, {
                    flowType: 'success_flow',
                    context: { some_field: faker.lorem.words(3) },
                })
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await ExecutionAIFlowTask.softDelete(anonymousClient, task.id, {
                        status: TASK_STATUSES.CANCELLED,
                    })
                })
            })
        })
    })

    describe('PII Masking', () => {
        test('should mask PII in context when creating task', async () => {
            const sensitiveContext = {
                name: 'John Doe',
                email: 'john.doe@example.com',
                phone: '+1 (555) 123-4567',
                notes: 'Contact me at john.doe@example.com or +1 (555) 123-4567',
                address: '123 Main St',
            }

            const [task] = await createTestExecutionAIFlowTask(adminClient, userClient.user, {
                flowType: 'success_flow',
                context: sensitiveContext,
            })

            const { cleaned } = removeSensitiveDataFromObj(sensitiveContext)

            expect(task.cleanContext).toBeDefined()
            expect(task.cleanContext).toEqual(cleaned)
            expect(task.context).toEqual(sensitiveContext)
        })      
    })  

    describe('Validations', () => {
        test('flowType should be from allowed list only', async () => {
            const [task] = await createTestExecutionAIFlowTask(adminClient, userClient.user, {
                flowType: 'success_flow',
                context: { some_field: faker.lorem.words(3) },
            })
            expect(task).toBeDefined()
            await expectToThrowGQLError(async () => {
                await createTestExecutionAIFlowTask(adminClient, userClient.user, {
                    flowType: 'unknown_type',
                    context: { some_field: faker.lorem.words(3) },
                })
            }, {
                code: 'BAD_USER_INPUT',
                type: 'UNKNOWN_FLOW_TYPE',
            })
        })

        test('context should be validated', async () => {
            const [task] = await createTestExecutionAIFlowTask(adminClient, userClient.user, {
                flowType: 'success_flow',
                context: { some_field: faker.lorem.words(3) },
            })
            expect(task).toBeDefined()
            await expectToThrowGQLError(async () => {
                await createTestExecutionAIFlowTask(adminClient, userClient.user, {
                    flowType: 'success_flow',
                    context: 'my_context',
                })
            }, {
                code: 'BAD_USER_INPUT',
                type: 'INVALID_FLOW_CONTEXT',
            })
        })
    })

    describe('Rate limiter', () => {
        test('User can run only 30 tasks per 1 hours (default limits)', async () => {
            const MAX_REQUESTS = 30

            for (let i = 0; i < MAX_REQUESTS; i++) {
                const selfTask = await ExecutionAIFlowTaskForUser.create(userClient, {
                    user: { connect: { id: userClient.user.id } },
                    flowType: 'success_flow',
                    context: { some_field: faker.lorem.words(3) },
                    dv: 1,
                    sender: { fingerprint: faker.random.alphaNumeric(8), dv: 1 },
                })
                expect(selfTask.user.id).toEqual(userClient.user.id)
            }

            await expectToThrowGQLError(async () => {
                await ExecutionAIFlowTaskForUser.create(userClient, {
                    user: { connect: { id: userClient.user.id } },
                    flowType: 'success_flow',
                    context: { some_field: faker.lorem.words(3) },
                    dv: 1,
                    sender: { fingerprint: faker.random.alphaNumeric(8), dv: 1 },
                })
            }, {
                code: 'BAD_USER_INPUT',
                type: 'TOO_MANY_REQUESTS',
                message: 'You have to wait {minutesRemaining} min. to be able to send request again',
            })
        })
    })

    describe('Real-life cases', () => {
        test('Successfully execution', async () => {
            const [task] = await createTestExecutionAIFlowTask(adminClient, userClient.user, {
                flowType: 'success_flow',
                context: { problem: faker.lorem.sentence() },
            })

            await waitFor(async () => {
                const foundTask = await ExecutionAIFlowTask.getOne(adminClient, { id: task.id })
                expect(foundTask.status).toBe(TASK_STATUSES.COMPLETED)
                expect(foundTask.result).toEqual(expect.objectContaining(
                    SUCCESS_FLOWISE_PREDICTION_RESULT.json,
                ))
                expect(foundTask.errorMessage).toBeNull()
                expect(foundTask.error).toBeNull()
                expect(foundTask.meta).toEqual(expect.objectContaining({
                    response: expect.objectContaining(SUCCESS_FLOWISE_PREDICTION_RESULT),
                }))
            })
        })

        test('Failed execution', async () => {
            const [task] = await createTestExecutionAIFlowTask(adminClient, userClient.user, {
                flowType: 'failed_flow',
                context: { problem: faker.lorem.sentence() },
            })

            await waitFor(async () => {
                const foundTask = await ExecutionAIFlowTask.getOne(adminClient, { id: task.id })
                expect(foundTask.status).toBe(TASK_STATUSES.ERROR)
                expect(foundTask.result).toBeNull()
                expect(foundTask.errorMessage).toBe('Failed to complete request')
                expect(foundTask.error).toEqual(expect.objectContaining({
                    developerErrorMessage: FAULTY_FLOWISE_PREDICTION_RESULT.message,
                }))
                expect(foundTask.meta).toEqual(expect.objectContaining({
                    response: expect.objectContaining(FAULTY_FLOWISE_PREDICTION_RESULT),
                }))
            })
        })
    })
})
