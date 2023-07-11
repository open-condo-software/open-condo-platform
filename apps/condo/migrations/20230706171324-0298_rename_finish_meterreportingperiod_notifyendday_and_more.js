// auto generated by kmigrator
// KMIGRATOR:0298_rename_finish_meterreportingperiod_notifyendday_and_more:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMSBvbiAyMDIzLTA3LTA2IDEyOjEzCgpmcm9tIGRqYW5nby5kYiBpbXBvcnQgbWlncmF0aW9ucwoKCmNsYXNzIE1pZ3JhdGlvbihtaWdyYXRpb25zLk1pZ3JhdGlvbik6CgogICAgZGVwZW5kZW5jaWVzID0gWwogICAgICAgICgnX2RqYW5nb19zY2hlbWEnLCAnMDI5N19iMmJhcHBfaGFzZHluYW1pY3RpdGxlX2FuZF9tb3JlJyksCiAgICBdCgogICAgb3BlcmF0aW9ucyA9IFsKICAgICAgICBtaWdyYXRpb25zLlJlbmFtZUZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdtZXRlcnJlcG9ydGluZ3BlcmlvZCcsCiAgICAgICAgICAgIG9sZF9uYW1lPSdmaW5pc2gnLAogICAgICAgICAgICBuZXdfbmFtZT0nbm90aWZ5RW5kRGF5JywKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuUmVuYW1lRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J21ldGVycmVwb3J0aW5ncGVyaW9kJywKICAgICAgICAgICAgb2xkX25hbWU9J3N0YXJ0JywKICAgICAgICAgICAgbmV3X25hbWU9J25vdGlmeVN0YXJ0RGF5JywKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuUmVuYW1lRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J21ldGVycmVwb3J0aW5ncGVyaW9kaGlzdG9yeXJlY29yZCcsCiAgICAgICAgICAgIG9sZF9uYW1lPSdmaW5pc2gnLAogICAgICAgICAgICBuZXdfbmFtZT0nbm90aWZ5RW5kRGF5JywKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuUmVuYW1lRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J21ldGVycmVwb3J0aW5ncGVyaW9kaGlzdG9yeXJlY29yZCcsCiAgICAgICAgICAgIG9sZF9uYW1lPSdzdGFydCcsCiAgICAgICAgICAgIG5ld19uYW1lPSdub3RpZnlTdGFydERheScsCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLlJlbW92ZUZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdtZXRlcnJlcG9ydGluZ3BlcmlvZCcsCiAgICAgICAgICAgIG5hbWU9J2IyY0FwcCcsCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLlJlbW92ZUZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdtZXRlcnJlcG9ydGluZ3BlcmlvZGhpc3RvcnlyZWNvcmQnLAogICAgICAgICAgICBuYW1lPSdiMmNBcHAnLAogICAgICAgICksCiAgICBdCg==

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Rename field finish on meterreportingperiod to notifyEndDay
--
ALTER TABLE "MeterReportingPeriod" RENAME COLUMN "finish" TO "notifyEndDay";
--
-- Rename field start on meterreportingperiod to notifyStartDay
--
ALTER TABLE "MeterReportingPeriod" RENAME COLUMN "start" TO "notifyStartDay";
--
-- Rename field finish on meterreportingperiodhistoryrecord to notifyEndDay
--
ALTER TABLE "MeterReportingPeriodHistoryRecord" RENAME COLUMN "finish" TO "notifyEndDay";
--
-- Rename field start on meterreportingperiodhistoryrecord to notifyStartDay
--
ALTER TABLE "MeterReportingPeriodHistoryRecord" RENAME COLUMN "start" TO "notifyStartDay";
--
-- Remove field b2cApp from meterreportingperiod
--
SET CONSTRAINTS "MeterReportingPeriod_b2cApp_76380b69_fk_B2CApp_id" IMMEDIATE; ALTER TABLE "MeterReportingPeriod" DROP CONSTRAINT "MeterReportingPeriod_b2cApp_76380b69_fk_B2CApp_id";
ALTER TABLE "MeterReportingPeriod" DROP COLUMN "b2cApp" CASCADE;
--
-- Remove field b2cApp from meterreportingperiodhistoryrecord
--
ALTER TABLE "MeterReportingPeriodHistoryRecord" DROP COLUMN "b2cApp" CASCADE;
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Remove field b2cApp from meterreportingperiodhistoryrecord
--
ALTER TABLE "MeterReportingPeriodHistoryRecord" ADD COLUMN "b2cApp" uuid NULL;
--
-- Remove field b2cApp from meterreportingperiod
--
ALTER TABLE "MeterReportingPeriod" ADD COLUMN "b2cApp" uuid NULL CONSTRAINT "MeterReportingPeriod_b2cApp_76380b69_fk_B2CApp_id" REFERENCES "B2CApp"("id") DEFERRABLE INITIALLY DEFERRED; SET CONSTRAINTS "MeterReportingPeriod_b2cApp_76380b69_fk_B2CApp_id" IMMEDIATE;
--
-- Rename field start on meterreportingperiodhistoryrecord to notifyStartDay
--
ALTER TABLE "MeterReportingPeriodHistoryRecord" RENAME COLUMN "notifyStartDay" TO "start";
--
-- Rename field finish on meterreportingperiodhistoryrecord to notifyEndDay
--
ALTER TABLE "MeterReportingPeriodHistoryRecord" RENAME COLUMN "notifyEndDay" TO "finish";
--
-- Rename field start on meterreportingperiod to notifyStartDay
--
ALTER TABLE "MeterReportingPeriod" RENAME COLUMN "notifyStartDay" TO "start";
--
-- Rename field finish on meterreportingperiod to notifyEndDay
--
ALTER TABLE "MeterReportingPeriod" RENAME COLUMN "notifyEndDay" TO "finish";
CREATE INDEX "MeterReportingPeriod_b2cApp_76380b69" ON "MeterReportingPeriod" ("b2cApp");
COMMIT;

    `)
}