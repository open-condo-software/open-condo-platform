// auto generated by kmigrator
// KMIGRATOR:0337_invoice_paymenttype_invoicehistoryrecord_paymenttype:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMi40IG9uIDIwMjMtMTAtMzEgMDU6MTIKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAzMzZfYXV0b18yMDIzMTAzMF8wNjIzJyksCiAgICBdCgogICAgb3BlcmF0aW9ucyA9IFsKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdpbnZvaWNlJywKICAgICAgICAgICAgbmFtZT0ncGF5bWVudFR5cGUnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuVGV4dEZpZWxkKGRlZmF1bHQ9J29ubGluZScpLAogICAgICAgICAgICBwcmVzZXJ2ZV9kZWZhdWx0PUZhbHNlLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5BZGRGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0naW52b2ljZWhpc3RvcnlyZWNvcmQnLAogICAgICAgICAgICBuYW1lPSdwYXltZW50VHlwZScsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5UZXh0RmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSwKICAgICAgICApLAogICAgXQo=

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field paymentType to invoice
--
ALTER TABLE "Invoice" ADD COLUMN "paymentType" text DEFAULT 'online' NOT NULL;
ALTER TABLE "Invoice" ALTER COLUMN "paymentType" DROP DEFAULT;
--
-- Add field paymentType to invoicehistoryrecord
--
ALTER TABLE "InvoiceHistoryRecord" ADD COLUMN "paymentType" text NULL;
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field paymentType to invoicehistoryrecord
--
ALTER TABLE "InvoiceHistoryRecord" DROP COLUMN "paymentType" CASCADE;
--
-- Add field paymentType to invoice
--
ALTER TABLE "Invoice" DROP COLUMN "paymentType" CASCADE;
COMMIT;

    `)
}
