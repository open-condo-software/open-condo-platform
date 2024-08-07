// auto generated by kmigrator
// KMIGRATOR:0413_userrightsset_canreadmessages_and_more:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMS41IG9uIDIwMjQtMDctMjkgMDg6MjkKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzA0MTJfbWFya2V0c2V0dGluZ2hpc3RvcnlyZWNvcmRfYW5kX21vcmUnKSwKICAgIF0KCiAgICBvcGVyYXRpb25zID0gWwogICAgICAgIG1pZ3JhdGlvbnMuQWRkRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J3VzZXJyaWdodHNzZXQnLAogICAgICAgICAgICBuYW1lPSdjYW5SZWFkTWVzc2FnZXMnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuQm9vbGVhbkZpZWxkKGRlZmF1bHQ9RmFsc2UpLAogICAgICAgICAgICBwcmVzZXJ2ZV9kZWZhdWx0PUZhbHNlLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5BZGRGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0ndXNlcnJpZ2h0c3NldGhpc3RvcnlyZWNvcmQnLAogICAgICAgICAgICBuYW1lPSdjYW5SZWFkTWVzc2FnZXMnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuQm9vbGVhbkZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSksCiAgICAgICAgKSwKICAgIF0K

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field canReadMessages to userrightsset
--
ALTER TABLE "UserRightsSet" ADD COLUMN "canReadMessages" boolean DEFAULT false NOT NULL;
ALTER TABLE "UserRightsSet" ALTER COLUMN "canReadMessages" DROP DEFAULT;
--
-- Add field canReadMessages to userrightssethistoryrecord
--
ALTER TABLE "UserRightsSetHistoryRecord" ADD COLUMN "canReadMessages" boolean NULL;
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field canReadMessages to userrightssethistoryrecord
--
ALTER TABLE "UserRightsSetHistoryRecord" DROP COLUMN "canReadMessages" CASCADE;
--
-- Add field canReadMessages to userrightsset
--
ALTER TABLE "UserRightsSet" DROP COLUMN "canReadMessages" CASCADE;
COMMIT;

    `)
}
