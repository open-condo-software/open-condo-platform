const SMS_AFTER_TICKET_CREATION = 'sms-after-ticket-creation'
const RE_FETCH_TICKETS_IN_CONTROL_ROOM = 'refetch-tickets-in-control-room'
const SEND_SUBMIT_METER_READINGS_PUSH_NOTIFICATIONS_TASK = 'send-submit-meter-readings-push-notifications-task'
const SEND_METER_VERIFICATION_DATE_REMINDER_TASK = 'send-verification-date-reminder-task'
const SEND_BILLING_RECEIPTS_NOTIFICATIONS_TASK = 'send-billing-receipts-notifications-task'
const TICKET_IMPORT = 'ticket-import'
const PAYMENT_LINK = 'payment-link'
const MAX_COUNT_COMPLETED_TICKET_TO_CLOSE_FOR_ORGANIZATION_TASK = 'max-count-completed-ticket-to-close-for-organization-task'
const HUAWEI_SILENT_DATA_PUSH_ENABLED = 'huawei-silent-data-push-enabled'
const PROPERTY_BANK_ACCOUNT = 'property-bank-account'
const PROPERTY_REPORT_DELETE_ENTITIES = 'property-report-delete-entities'
const SERVICE_PROVIDER_PROFILE = 'service-provider-profile'
const DISABLE_DISCOVER_SERVICE_CONSUMERS = 'disable-discover-service-consumers'
const TICKET_SUBMITTING_FORM_RESIDENT_MOBILE_APP = 'ticket-submitting-from-resident-mobile-app'
const BIGGER_LIMIT_FOR_IMPORT = 'bigger-limit-for-import'
const SEND_BILLING_RECEIPTS_ON_PAYDAY_REMAINDER_TASK = 'send-billing-receipts-on-payday-remainder-task'
const MARKETPLACE = 'marketplace'
const SHOW_TELEGRAM_NOTIFICATIONS_BANNER = 'show-telegram-notifications-banner'
const MAX_EMPLOYEE_SIZE_IN_ORGANIZATION_TO_TELEGRAM_NOTIFICATIONS = 'max-employee-size-in-organization-to-telegram-notifications'
const SEND_TELEGRAM_NOTIFICATIONS = 'send-telegram-notifications'
const CAPTCHA_CHECK_ENABLED = 'captcha-check-enabled'
// TODO(DOMA-8667): Remove flag after links to instructions will be ready
const IMPORT_HELP_MODAL = 'import-help-modal'
const SEND_DAILY_STATISTICS_TASK = 'send-daily-statistics-task'
const RETENTION_LOOPS_ENABLED = 'retention-loops-enabled'
const SERVICE_PROBLEMS_ALERT = 'service-problems-alert'
const TICKET_AUTO_ASSIGNMENT_MANAGEMENT = 'ticket-auto-assignment-management'
const POLL_TICKET_COMMENTS = 'poll-ticket-comments'
const REASSIGN_EMPLOYEE_TICKETS = 'reassign-employee-tickets'
const SNOWFLAKES_SETTINGS = 'snowflakes-settings'
const USER_WHITE_LIST_FOR_FIND_ORGANIZATIONS_BY_TIN = 'user-white-list-for-find-organizations-by-tin'
const METER_REPORTING_PERIOD_STRICT_RULE = 'meter-reporting-period-strict-rule'
const SUBSCRIPTION = 'subscription'
const CHECK_TLS_CLIENT_CERT = 'check-tls-client-cert-config'
const ADD_SECTION_FLOOR = 'add-section-floor'
const ACQUIRING_PAYMENTS_FILES_TABLE = 'acquiring-payments-files-table'
const HIDE_ORGANIZATION_REQUESTS = 'hide-organization-requests'


module.exports = {
    SMS_AFTER_TICKET_CREATION,
    RE_FETCH_TICKETS_IN_CONTROL_ROOM,
    SEND_SUBMIT_METER_READINGS_PUSH_NOTIFICATIONS_TASK,
    SEND_METER_VERIFICATION_DATE_REMINDER_TASK,
    SEND_BILLING_RECEIPTS_NOTIFICATIONS_TASK,
    TICKET_IMPORT,
    PAYMENT_LINK,
    MAX_COUNT_COMPLETED_TICKET_TO_CLOSE_FOR_ORGANIZATION_TASK,
    HUAWEI_SILENT_DATA_PUSH_ENABLED,
    PROPERTY_BANK_ACCOUNT,
    PROPERTY_REPORT_DELETE_ENTITIES,
    SERVICE_PROVIDER_PROFILE,
    DISABLE_DISCOVER_SERVICE_CONSUMERS,
    TICKET_SUBMITTING_FORM_RESIDENT_MOBILE_APP,
    BIGGER_LIMIT_FOR_IMPORT,
    SEND_BILLING_RECEIPTS_ON_PAYDAY_REMAINDER_TASK,
    MARKETPLACE,
    SHOW_TELEGRAM_NOTIFICATIONS_BANNER,
    MAX_EMPLOYEE_SIZE_IN_ORGANIZATION_TO_TELEGRAM_NOTIFICATIONS,
    SEND_TELEGRAM_NOTIFICATIONS,
    CAPTCHA_CHECK_ENABLED,
    IMPORT_HELP_MODAL,
    RETENTION_LOOPS_ENABLED,
    SEND_DAILY_STATISTICS_TASK,
    SERVICE_PROBLEMS_ALERT,
    TICKET_AUTO_ASSIGNMENT_MANAGEMENT,
    POLL_TICKET_COMMENTS,
    REASSIGN_EMPLOYEE_TICKETS,
    SNOWFLAKES_SETTINGS,
    USER_WHITE_LIST_FOR_FIND_ORGANIZATIONS_BY_TIN,
    METER_REPORTING_PERIOD_STRICT_RULE,
    SUBSCRIPTION,
    CHECK_TLS_CLIENT_CERT,
    ADD_SECTION_FLOOR,
    ACQUIRING_PAYMENTS_FILES_TABLE,
    HIDE_ORGANIZATION_REQUESTS,
}
