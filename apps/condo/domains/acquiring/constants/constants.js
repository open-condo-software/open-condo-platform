const RESIDENT_CALCULATE_FEE_FOR_RECEIPT_WINDOW_IN_SEC = 60 * 60 // 1 hour in seconds
const MAX_RESIDENT_CALCULATE_FEE_FOR_RECEIPT_WINDOW_IN_SEC_CALLS_BY_WINDOW_SEC = 100

const PAYMENTS_FILES_FOLDER_NAME = 'payments_files'

const PAYMENTS_FILE_NEW_STATUS = 'NEW'
const PAYMENTS_FILE_DOWNLOADED_STATUS = 'DOWNLOADED'

const PAYMENTS_FILE_STATUSES = [
    PAYMENTS_FILE_NEW_STATUS,
    PAYMENTS_FILE_DOWNLOADED_STATUS,
]

module.exports = {
    RESIDENT_CALCULATE_FEE_FOR_RECEIPT_WINDOW_IN_SEC,
    MAX_RESIDENT_CALCULATE_FEE_FOR_RECEIPT_WINDOW_IN_SEC_CALLS_BY_WINDOW_SEC,
    PAYMENTS_FILES_FOLDER_NAME,
    PAYMENTS_FILE_NEW_STATUS,
    PAYMENTS_FILE_DOWNLOADED_STATUS,
    PAYMENTS_FILE_STATUSES,
}