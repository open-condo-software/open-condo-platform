// auto generated by kmigrator
// KMIGRATOR:0088_auto_20211207_1037:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDMuMi44IG9uIDIwMjEtMTItMDcgMTA6MzcKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAwODZfc2VydmljZWNvbnN1bWVyaGlzdG9yeXJlY29yZF9yZXNpZGVudGFjcXVpcmluZ2ludGVncmF0aW9uY29udGV4dCcpLAogICAgXQoKICAgIG9wZXJhdGlvbnMgPSBbCiAgICAgICAgbWlncmF0aW9ucy5BZGRGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nbXVsdGlwYXltZW50JywKICAgICAgICAgICAgbmFtZT0naW1wb3J0SWQnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuVGV4dEZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSksCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdtdWx0aXBheW1lbnRoaXN0b3J5cmVjb3JkJywKICAgICAgICAgICAgbmFtZT0naW1wb3J0SWQnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuVGV4dEZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSksCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdwYXltZW50JywKICAgICAgICAgICAgbmFtZT0naW1wb3J0SWQnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuVGV4dEZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSksCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdwYXltZW50aGlzdG9yeXJlY29yZCcsCiAgICAgICAgICAgIG5hbWU9J2ltcG9ydElkJywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLlRleHRGaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpLAogICAgICAgICksCiAgICBdCg==

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field importId to multipayment
--
ALTER TABLE "MultiPayment" ADD COLUMN "importId" text NULL;
--
-- Add field importId to multipaymenthistoryrecord
--
ALTER TABLE "MultiPaymentHistoryRecord" ADD COLUMN "importId" text NULL;
--
-- Add field importId to payment
--
ALTER TABLE "Payment" ADD COLUMN "importId" text NULL;
--
-- Add field importId to paymenthistoryrecord
--
ALTER TABLE "PaymentHistoryRecord" ADD COLUMN "importId" text NULL;
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field importId to paymenthistoryrecord
--
ALTER TABLE "PaymentHistoryRecord" DROP COLUMN "importId" CASCADE;
--
-- Add field importId to payment
--
ALTER TABLE "Payment" DROP COLUMN "importId" CASCADE;
--
-- Add field importId to multipaymenthistoryrecord
--
ALTER TABLE "MultiPaymentHistoryRecord" DROP COLUMN "importId" CASCADE;
--
-- Add field importId to multipayment
--
ALTER TABLE "MultiPayment" DROP COLUMN "importId" CASCADE;
COMMIT;

    `)
}
