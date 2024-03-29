// auto generated by kmigrator
// KMIGRATOR:0223_billingreceipthistoryrecord_invalidserviceserror:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMS4zIG9uIDIwMjMtMDItMjEgMDY6MzIKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAyMjJfbWVyZ2VfMjAyMzAyMjBfMTMxNicpLAogICAgXQoKICAgIG9wZXJhdGlvbnMgPSBbCiAgICAgICAgbWlncmF0aW9ucy5BZGRGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nYmlsbGluZ3JlY2VpcHRoaXN0b3J5cmVjb3JkJywKICAgICAgICAgICAgbmFtZT0naW52YWxpZFNlcnZpY2VzRXJyb3InLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuSlNPTkZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSksCiAgICAgICAgKSwKICAgIF0K

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;

--
-- [CUSTOM] Set Statement Timeout to some large amount - 25 min (25 * 60 => 1500 sec)
--
SET statement_timeout = '1500s';  

--
-- Add field invalidServicesError to billingreceipthistoryrecord
--
ALTER TABLE "BillingReceiptHistoryRecord" ADD COLUMN "invalidServicesError" jsonb NULL;

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
-- Add field invalidServicesError to billingreceipthistoryrecord
--
ALTER TABLE "BillingReceiptHistoryRecord" DROP COLUMN "invalidServicesError" CASCADE;

--
-- [CUSTOM] Revert Statement Timeout to default amount - 10 secs
--
SET statement_timeout = '10s';

COMMIT;

    `)
}
