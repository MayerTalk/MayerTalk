import { hasOwn } from '@/lib/utils/tool'
import type { SupportLangKey } from '@/lib/lang/constant'

const LANG_2_KEY_DICT: Record<string, SupportLangKey> = {
    // 简中服（简体中文）
    zh: 'zh_CN',
    'zh-CN': 'zh_CN',
    'zh-SG': 'zh_CN',
    // 繁中服（繁体中文）
    'zh-TW': 'zh_TW',
    'zh-HK': 'zh_TW',
    'zh-MO': 'zh_TW',
    'zh-Hant': 'zh_TW',
    // 日服（日文）
    ja: 'ja_JP',
    // 国际服（英文）
    en: 'en_US'
} as const

let defaultLang: SupportLangKey = 'en_US'

for (const lang of navigator.languages) {
    if (hasOwn(LANG_2_KEY_DICT, lang)) {
        defaultLang = LANG_2_KEY_DICT[lang]
        break
    } else if (hasOwn(LANG_2_KEY_DICT, lang.split('-')[0])) {
        defaultLang = LANG_2_KEY_DICT[lang.split('-')[0]]
        break
    }
}

const DEFAULT_LANG = defaultLang

export {
    DEFAULT_LANG
}
