// auto generated by kmigrator
// KMIGRATOR:0446_auto_20250205_0915:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDUuMSBvbiAyMDI1LTAyLTA1IDA5OjE1Cgpmcm9tIGRqYW5nby5kYiBpbXBvcnQgbWlncmF0aW9ucwoKCmNsYXNzIE1pZ3JhdGlvbihtaWdyYXRpb25zLk1pZ3JhdGlvbik6CgogICAgZGVwZW5kZW5jaWVzID0gWwogICAgICAgICgnX2RqYW5nb19zY2hlbWEnLCAnMDQ0NV9vcmdhbml6YXRpb25lbXBsb3llZXJlcXVlc3RoaXN0b3J5cmVjb3JkX2FuZF9tb3JlJyksCiAgICBdCgogICAgb3BlcmF0aW9ucyA9IFsKICAgIF0K

exports.up = async (knex) => {
    await knex.raw(`
        BEGIN;
        
        UPDATE "B2CApp" SET "importRemoteSystem" = 'dev-portal' WHERE "importRemoteSystem" = 'dev-api';
        UPDATE "B2CAppAccessRight" SET "importRemoteSystem" = 'dev-portal' WHERE "importRemoteSystem" = 'dev-api';
        UPDATE "B2CAppBuild" SET "importRemoteSystem" = 'dev-portal' WHERE "importRemoteSystem" = 'dev-api';
        
        COMMIT;
    `)
}

exports.down = async (knex) => {
    await knex.raw(`
        BEGIN;
        
        UPDATE "B2CApp" SET "importRemoteSystem" = 'dev-api' WHERE "importRemoteSystem" = 'dev-portal';
        UPDATE "B2CAppAccessRight" SET "importRemoteSystem" = 'dev-api' WHERE "importRemoteSystem" = 'dev-portal';
        UPDATE "B2CAppBuild" SET "importRemoteSystem" = 'dev-api' WHERE "importRemoteSystem" = 'dev-portal';
        
        COMMIT;
    `)
}
