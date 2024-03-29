// auto generated by kmigrator
// KMIGRATOR:0231_rename_bankintegrationcontext_bankintegrationaccountcontext_and_more:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMSBvbiAyMDIzLTAzLTA5IDEwOjIzCgpmcm9tIGRqYW5nby5kYiBpbXBvcnQgbWlncmF0aW9ucwoKCmNsYXNzIE1pZ3JhdGlvbihtaWdyYXRpb25zLk1pZ3JhdGlvbik6CgogICAgZGVwZW5kZW5jaWVzID0gWwogICAgICAgICgnX2RqYW5nb19zY2hlbWEnLCAnMDIzMF9vcmdhbml6YXRpb25fZmVhdHVyZXNfYW5kX21vcmUnKSwKICAgIF0KCiAgICBvcGVyYXRpb25zID0gWwogICAgICAgIG1pZ3JhdGlvbnMuUmVuYW1lTW9kZWwoCiAgICAgICAgICAgIG9sZF9uYW1lPSdiYW5raW50ZWdyYXRpb25jb250ZXh0JywKICAgICAgICAgICAgbmV3X25hbWU9J2JhbmtpbnRlZ3JhdGlvbmFjY291bnRjb250ZXh0JywKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuUmVuYW1lTW9kZWwoCiAgICAgICAgICAgIG9sZF9uYW1lPSdiYW5raW50ZWdyYXRpb25jb250ZXh0aGlzdG9yeXJlY29yZCcsCiAgICAgICAgICAgIG5ld19uYW1lPSdiYW5raW50ZWdyYXRpb25hY2NvdW50Y29udGV4dGhpc3RvcnlyZWNvcmQnLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5SZW5hbWVGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nb3JnYW5pemF0aW9uZW1wbG95ZWVyb2xlJywKICAgICAgICAgICAgb2xkX25hbWU9J2Nhbk1hbmFnZUJhbmtJbnRlZ3JhdGlvbkNvbnRleHRzJywKICAgICAgICAgICAgbmV3X25hbWU9J2Nhbk1hbmFnZUJhbmtJbnRlZ3JhdGlvbkFjY291bnRDb250ZXh0cycsCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLlJlbmFtZUZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdvcmdhbml6YXRpb25lbXBsb3llZXJvbGVoaXN0b3J5cmVjb3JkJywKICAgICAgICAgICAgb2xkX25hbWU9J2Nhbk1hbmFnZUJhbmtJbnRlZ3JhdGlvbkNvbnRleHRzJywKICAgICAgICAgICAgbmV3X25hbWU9J2Nhbk1hbmFnZUJhbmtJbnRlZ3JhdGlvbkFjY291bnRDb250ZXh0cycsCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFsdGVyTW9kZWxUYWJsZSgKICAgICAgICAgICAgbmFtZT0nYmFua2ludGVncmF0aW9uYWNjb3VudGNvbnRleHQnLAogICAgICAgICAgICB0YWJsZT0nQmFua0ludGVncmF0aW9uQWNjb3VudENvbnRleHQnLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5BbHRlck1vZGVsVGFibGUoCiAgICAgICAgICAgIG5hbWU9J2JhbmtpbnRlZ3JhdGlvbmFjY291bnRjb250ZXh0aGlzdG9yeXJlY29yZCcsCiAgICAgICAgICAgIHRhYmxlPSdCYW5rSW50ZWdyYXRpb25BY2NvdW50Q29udGV4dEhpc3RvcnlSZWNvcmQnLAogICAgICAgICksCiAgICBdCg==

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Rename model bankintegrationcontext to bankintegrationaccountcontext
--
-- (no-op)
--
-- Rename model bankintegrationcontexthistoryrecord to bankintegrationaccountcontexthistoryrecord
--
-- (no-op)
--
-- Rename field canManageBankIntegrationContexts on organizationemployeerole to canManageBankIntegrationAccountContexts
--
ALTER TABLE "OrganizationEmployeeRole" RENAME COLUMN "canManageBankIntegrationContexts" TO "canManageBankIntegrationAccountContexts";
--
-- Rename field canManageBankIntegrationContexts on organizationemployeerolehistoryrecord to canManageBankIntegrationAccountContexts
--
ALTER TABLE "OrganizationEmployeeRoleHistoryRecord" RENAME COLUMN "canManageBankIntegrationContexts" TO "canManageBankIntegrationAccountContexts";
--
-- Rename table for bankintegrationaccountcontext to BankIntegrationAccountContext
--
ALTER TABLE "BankIntegrationContext" RENAME TO "BankIntegrationAccountContext";
--
-- Rename table for bankintegrationaccountcontexthistoryrecord to BankIntegrationAccountContextHistoryRecord
--
ALTER TABLE "BankIntegrationContextHistoryRecord" RENAME TO "BankIntegrationAccountContextHistoryRecord";
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Rename table for bankintegrationaccountcontexthistoryrecord to BankIntegrationAccountContextHistoryRecord
--
ALTER TABLE "BankIntegrationAccountContextHistoryRecord" RENAME TO "BankIntegrationContextHistoryRecord";
--
-- Rename table for bankintegrationaccountcontext to BankIntegrationAccountContext
--
ALTER TABLE "BankIntegrationAccountContext" RENAME TO "BankIntegrationContext";
--
-- Rename field canManageBankIntegrationContexts on organizationemployeerolehistoryrecord to canManageBankIntegrationAccountContexts
--
ALTER TABLE "OrganizationEmployeeRoleHistoryRecord" RENAME COLUMN "canManageBankIntegrationAccountContexts" TO "canManageBankIntegrationContexts";
--
-- Rename field canManageBankIntegrationContexts on organizationemployeerole to canManageBankIntegrationAccountContexts
--
ALTER TABLE "OrganizationEmployeeRole" RENAME COLUMN "canManageBankIntegrationAccountContexts" TO "canManageBankIntegrationContexts";
--
-- Rename model bankintegrationcontexthistoryrecord to bankintegrationaccountcontexthistoryrecord
--
-- (no-op)
--
-- Rename model bankintegrationcontext to bankintegrationaccountcontext
--
-- (no-op)
COMMIT;

    `)
}
