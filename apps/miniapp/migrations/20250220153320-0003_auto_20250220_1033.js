// auto generated by kmigrator
// KMIGRATOR:0003_auto_20250220_1033:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDUuMSBvbiAyMDI1LTAyLTIwIDEwOjMzCgpmcm9tIGRqYW5nby5kYiBpbXBvcnQgbWlncmF0aW9ucwoKCmNsYXNzIE1pZ3JhdGlvbihtaWdyYXRpb25zLk1pZ3JhdGlvbik6CgogICAgZGVwZW5kZW5jaWVzID0gWwogICAgICAgICgnX2RqYW5nb19zY2hlbWEnLCAnMDAwMl9hdXRvXzIwMjQwODEyXzA2NDEnKSwKICAgIF0KCiAgICBvcGVyYXRpb25zID0gWwogICAgXQo=

const { checkMinimalKVDataVersion, getKVClient } = require('@open-condo/keystone/kv')

exports.up = async () => {
    await checkMinimalKVDataVersion(2)
}

exports.down = async () => {
    const kv = getKVClient()
    const versionString = await kv.get('data_version')
    const dbSize = await kv.dbsize()
    // Rollback "empty db" if statement, since non-empty one mutates nothing
    if (dbSize === 1 && versionString === '2') {
        await kv.del('data_version')
    }
}
