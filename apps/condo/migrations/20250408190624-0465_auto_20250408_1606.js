// auto generated by kmigrator
// KMIGRATOR:0465_auto_20250408_1606:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMi4xMyBvbiAyMDI1LTA0LTA4IDE2OjA2Cgpmcm9tIGRqYW5nby5kYiBpbXBvcnQgbWlncmF0aW9ucwoKCmNsYXNzIE1pZ3JhdGlvbihtaWdyYXRpb25zLk1pZ3JhdGlvbik6CgogICAgZGVwZW5kZW5jaWVzID0gWwogICAgICAgICgnX2RqYW5nb19zY2hlbWEnLCAnMDQ2NF90aWNrZXRfbGFzdGNvbW1lbnR3aXRob3JnYW5pemF0aW9udHlwZWF0X2FuZF9tb3JlJyksCiAgICBdCgogICAgb3BlcmF0aW9ucyA9IFsKICAgIF0K

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;

    --
    -- Add hot water category to billingCategory
    --
    INSERT INTO public."BillingCategory" (dv, sender, name, id, v, "createdAt", "updatedAt", "deletedAt", "newId", "createdBy", "updatedBy",
    "receiptValidityMonths", "skipNotifications", "requiresFullPayment")
    VALUES (1::integer, '{"dv": 1, "fingerprint":"sql-migration"}'::jsonb, 'billing.category.hot_water.name'::text,
            '11d66984-5316-4cad-991f-5a7002b66149'::uuid, 1::integer, null::timestamp with time zone,
            null::timestamp with time zone, null::timestamp with time zone, null::uuid, null::uuid, null::uuid,
            3, FALSE, FALSE);
    COMMIT;
    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
    
    DELETE FROM "BillingCategory" where id = '11d66984-5316-4cad-991f-5a7002b66149';

    COMMIT;
    `)
}
