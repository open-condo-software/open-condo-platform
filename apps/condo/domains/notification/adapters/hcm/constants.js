const URGENCY_HIGH = 'HIGH'
const URGENCY_NORMAL = 'NORMAL'

const IMPORTANCE_HIGH = 'HIGH'
const IMPORTANCE_NORMAL = 'NORMAL'
const IMPORTANCE_LOW = 'LOW'

const DIR_AUTO = 'auto'
const DIR_LTR = 'ltr'
const DIR_RTL = 'rtl'

const WEB_URGENCY_HIGH = 'high'
const WEB_URGENCY_NORMAL = 'normal'
const WEB_URGENCY_LOW = 'low'
const WEB_URGENCY_VERY_LOW = 'very-low'

const STYLE_BIG_TEXT = 1
const STYLE_BIG_PICTURE = 2

const CLICK_ACTION_TYPE_INTENT = 1
const CLICK_ACTION_TYPE_URL = 2
const CLICK_ACTION_TYPE_APP = 3
const CLICK_ACTION_TYPE_RICH_RESOURCE = 4

const PATTERN = new RegExp('\\d+|\\d+[sS]|\\d+.\\d{1,9}|\\d+.\\d{1,9}[sS]')
const COLOR_PATTERN = new RegExp('^#[0-9a-fA-F]{6}$')
const TTL_INIT = '86400'

const DEFAULT_NOTIFICATION_OPTIONS = { 'click_action': { 'type': CLICK_ACTION_TYPE_APP }, 'foreground_show': false }

const TOKEN_TIMEOUT_ERROR = '80200003'
const TOKEN_FAILED_ERROR  = '80200001'
const PUSH_SUCCESS_CODE = '80000000'
const PUSH_PARTIAL_SUCCESS_CODE = '80100000'
const SUCCESS_CODES = [PUSH_SUCCESS_CODE, PUSH_PARTIAL_SUCCESS_CODE]


module.exports = {
    URGENCY_HIGH, URGENCY_NORMAL,
    IMPORTANCE_HIGH, IMPORTANCE_NORMAL, IMPORTANCE_LOW,
    DIR_AUTO, DIR_LTR, DIR_RTL,
    WEB_URGENCY_HIGH, WEB_URGENCY_NORMAL, WEB_URGENCY_LOW, WEB_URGENCY_VERY_LOW,
    STYLE_BIG_TEXT, STYLE_BIG_PICTURE,
    CLICK_ACTION_TYPE_INTENT, CLICK_ACTION_TYPE_URL, CLICK_ACTION_TYPE_APP, CLICK_ACTION_TYPE_RICH_RESOURCE,
    PATTERN, COLOR_PATTERN, TTL_INIT,
    DEFAULT_NOTIFICATION_OPTIONS,
    TOKEN_TIMEOUT_ERROR, TOKEN_FAILED_ERROR, PUSH_SUCCESS_CODE, PUSH_PARTIAL_SUCCESS_CODE, SUCCESS_CODES,
}