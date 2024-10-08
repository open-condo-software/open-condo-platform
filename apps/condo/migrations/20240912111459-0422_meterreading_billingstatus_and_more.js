// auto generated by kmigrator
// KMIGRATOR:0422_meterreading_billingstatus_and_more:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDUuMSBvbiAyMDI0LTA5LTEyIDA2OjE1Cgpmcm9tIGRqYW5nby5kYiBpbXBvcnQgbWlncmF0aW9ucywgbW9kZWxzCgoKY2xhc3MgTWlncmF0aW9uKG1pZ3JhdGlvbnMuTWlncmF0aW9uKToKCiAgICBkZXBlbmRlbmNpZXMgPSBbCiAgICAgICAgKCdfZGphbmdvX3NjaGVtYScsICcwNDIxX2F1dG9fMjAyNDA5MDVfMDcxMicpLAogICAgXQoKICAgIG9wZXJhdGlvbnMgPSBbCiAgICAgICAgbWlncmF0aW9ucy5BZGRGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nbWV0ZXJyZWFkaW5nJywKICAgICAgICAgICAgbmFtZT0nYmlsbGluZ1N0YXR1cycsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5UZXh0RmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSwKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuQWRkRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J21ldGVycmVhZGluZycsCiAgICAgICAgICAgIG5hbWU9J2JpbGxpbmdTdGF0dXNUZXh0JywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLlRleHRGaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5BZGRGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nbWV0ZXJyZWFkaW5naGlzdG9yeXJlY29yZCcsCiAgICAgICAgICAgIG5hbWU9J2JpbGxpbmdTdGF0dXMnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuVGV4dEZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSksCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdtZXRlcnJlYWRpbmdoaXN0b3J5cmVjb3JkJywKICAgICAgICAgICAgbmFtZT0nYmlsbGluZ1N0YXR1c1RleHQnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuVGV4dEZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSksCiAgICAgICAgKSwKICAgIF0K

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
SET statement_timeout = '1500s';
--
-- Add field billingStatus to meterreading
--
ALTER TABLE "MeterReading" ADD COLUMN "billingStatus" text NULL;
--
-- Add field billingStatusText to meterreading
--
ALTER TABLE "MeterReading" ADD COLUMN "billingStatusText" text NULL;
--
-- Add field billingStatus to meterreadinghistoryrecord
--
ALTER TABLE "MeterReadingHistoryRecord" ADD COLUMN "billingStatus" text NULL;
--
-- Add field billingStatusText to meterreadinghistoryrecord
--
ALTER TABLE "MeterReadingHistoryRecord" ADD COLUMN "billingStatusText" text NULL;

SET statement_timeout = '10s';
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field billingStatusText to meterreadinghistoryrecord
--
ALTER TABLE "MeterReadingHistoryRecord" DROP COLUMN "billingStatusText" CASCADE;
--
-- Add field billingStatus to meterreadinghistoryrecord
--
ALTER TABLE "MeterReadingHistoryRecord" DROP COLUMN "billingStatus" CASCADE;
--
-- Add field billingStatusText to meterreading
--
ALTER TABLE "MeterReading" DROP COLUMN "billingStatusText" CASCADE;
--
-- Add field billingStatus to meterreading
--
ALTER TABLE "MeterReading" DROP COLUMN "billingStatus" CASCADE;
COMMIT;

    `)
}
