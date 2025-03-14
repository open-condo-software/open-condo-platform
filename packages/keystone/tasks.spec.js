const { getKVClient } = require('./kv')
const { createTask, createWorker, taskQueues } = require('./tasks')

function createTaskFactory () {
    return async function asyncAddTask (a, b) {
        if (b === 0) throw new Error('DivBy0')
        return Promise.resolve(a / b)
    }
}

describe('tasks', () => {
    beforeAll(async () => {
        const kv = getKVClient()
        await kv.set('data_version', 2)
        return await createWorker()
    })

    afterAll(async () => {
        await Promise.all(Array.from(taskQueues.entries()).map(([,queue]) => queue.close()))
    })

    test('createTask result', () => {
        const task = createTask('asyncAddTask1', createTaskFactory())
        expect(task).toHaveProperty('delay')
        expect(task).toHaveProperty('applyAsync')
        expect(task._type).toEqual('TASK')
        expect(task).toThrowError(/This function is converted to a task/)
    })

    test('createTask().delay result', async () => {
        const task = createTask('asyncAddTask2', createTaskFactory())
        const delayed = await task.delay(33, 3)
        expect(delayed).toHaveProperty('getState')
        expect(delayed).toHaveProperty('awaitResult')
        expect(delayed).toHaveProperty('id')
        expect(typeof delayed.id).toEqual('string')
    })

    test('awaitResult', async () => {
        const task = createTask('asyncAddTask3', createTaskFactory())
        const delayed = await task.delay(44, 2)
        const result = await delayed.awaitResult()
        expect(result).toEqual(22)
    })

    test('awaitResult error', async () => {
        const task = createTask('asyncAddTask3E', createTaskFactory())
        const delayed = await task.delay(10, 0)
        const func = async () => await delayed.awaitResult()
        await expect(func()).rejects.toThrow('DivBy0')
    })

    test('getState', async () => {
        const task = createTask('asyncAddTask4', createTaskFactory())
        const delayed = await task.delay(44, 11)
        const result = await delayed.awaitResult()
        expect(result).toEqual(4)
        const state2 = await delayed.getState()
        expect(state2).toEqual('completed')
    })

    test('createTask().applyAsync result', async () => {
        const task = createTask('asyncAddTask5', createTaskFactory())
        const delayed = await task.applyAsync([333, 3])
        expect(delayed).toHaveProperty('getState')
        expect(delayed).toHaveProperty('awaitResult')
    })
})
