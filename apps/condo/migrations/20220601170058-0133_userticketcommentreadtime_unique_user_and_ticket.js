// auto generated by kmigrator
// KMIGRATOR:0133_userticketcommentreadtime_unique_user_and_ticket:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMCBvbiAyMDIyLTA2LTAxIDEyOjAwCgpmcm9tIGRqYW5nby5kYiBpbXBvcnQgbWlncmF0aW9ucywgbW9kZWxzCgoKY2xhc3MgTWlncmF0aW9uKG1pZ3JhdGlvbnMuTWlncmF0aW9uKToKCiAgICBkZXBlbmRlbmNpZXMgPSBbCiAgICAgICAgKCdfZGphbmdvX3NjaGVtYScsICcwMTMyX3JlbW92ZV91c2VyX2lzYWN0aXZlX2FuZF9tb3JlJyksCiAgICBdCgogICAgb3BlcmF0aW9ucyA9IFsKICAgICAgICBtaWdyYXRpb25zLkFkZENvbnN0cmFpbnQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J3VzZXJ0aWNrZXRjb21tZW50cmVhZHRpbWUnLAogICAgICAgICAgICBjb25zdHJhaW50PW1vZGVscy5VbmlxdWVDb25zdHJhaW50KGNvbmRpdGlvbj1tb2RlbHMuUSgoJ2RlbGV0ZWRBdF9faXNudWxsJywgVHJ1ZSkpLCBmaWVsZHM9KCd1c2VyJywgJ3RpY2tldCcpLCBuYW1lPSd1bmlxdWVfdXNlcl9hbmRfdGlja2V0JyksCiAgICAgICAgKSwKICAgIF0K

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Create constraint unique_user_and_ticket on model userticketcommentreadtime
--
CREATE UNIQUE INDEX "unique_user_and_ticket" ON "UserTicketCommentReadTime" ("user", "ticket") WHERE "deletedAt" IS NULL;
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Create constraint unique_user_and_ticket on model userticketcommentreadtime
--
DROP INDEX IF EXISTS "unique_user_and_ticket";
COMMIT;

    `)
}
