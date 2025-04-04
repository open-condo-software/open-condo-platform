// auto generated by kmigrator
// KMIGRATOR:0428_contact_contact_phone_isverified:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMi4xMyBvbiAyMDI0LTA5LTI2IDE0OjA4CgppbXBvcnQgZGphbmdvLmNvbnRyaWIucG9zdGdyZXMuaW5kZXhlcwpmcm9tIGRqYW5nby5kYiBpbXBvcnQgbWlncmF0aW9ucwoKCmNsYXNzIE1pZ3JhdGlvbihtaWdyYXRpb25zLk1pZ3JhdGlvbik6CgogICAgZGVwZW5kZW5jaWVzID0gWwogICAgICAgICgnX2RqYW5nb19zY2hlbWEnLCAnMDQyN19iaWxsaW5ncmVjZWlwdF9iaWxsaW5ncmVjZWlwdF91bmlxdWVfY29udGV4dF9hbmRfaW1wb3J0aWQnKSwKICAgIF0KCiAgICBvcGVyYXRpb25zID0gWwogICAgICAgIG1pZ3JhdGlvbnMuQWRkSW5kZXgoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J2NvbnRhY3QnLAogICAgICAgICAgICBpbmRleD1kamFuZ28uY29udHJpYi5wb3N0Z3Jlcy5pbmRleGVzLkJUcmVlSW5kZXgoZmllbGRzPVsncGhvbmUnLCAnaXNWZXJpZmllZCddLCBuYW1lPSdjb250YWN0X3Bob25lX2lzdmVyaWZpZWQnKSwKICAgICAgICApLAogICAgXQo=

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
    --
    -- [CUSTOM] Set Statement Timeout to some large amount - 25 min (25 * 60 => 1500 sec)
    --
    SET statement_timeout = '1500s';
    --
    -- Create index contact_phone_isverified on field(s) phone, isVerified of model contact
    --
    CREATE INDEX IF NOT EXISTS "contact_phone_isverified" ON "Contact" USING btree ("phone", "isVerified");
    --
    -- [CUSTOM] Revert Statement Timeout to default amount - 10 secs
    --
    SET statement_timeout = '10s';
    COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
    --
    -- [CUSTOM] Set Statement Timeout to some large amount - 25 min (25 * 60 => 1500 sec)
    --
    SET statement_timeout = '1500s';
    --
    -- Create index contact_phone_isverified on field(s) phone, isVerified of model contact
    --
    DROP INDEX IF EXISTS "contact_phone_isverified";
    --
    -- [CUSTOM] Revert Statement Timeout to default amount - 10 secs
    --
    SET statement_timeout = '10s';
    COMMIT;

    `)
}
