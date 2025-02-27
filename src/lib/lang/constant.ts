import emptyTranslation from '@/lib/lang/emptyTranslation'


const ORIGIN_DATA = [
    ['zh_CN', '简中'],
    ['zh_TW', '繁中'],
    ['en_US', 'English'],
    ['ja_JP', '日本語']
] as const

type SupportLangKey = typeof ORIGIN_DATA[number][0]

const LANG_DICT = Object.fromEntries(ORIGIN_DATA) as Readonly<Record<SupportLangKey, string>>

const SUPPORT_LANG: Readonly<SupportLangKey[]> = Object.keys(LANG_DICT) as SupportLangKey[]


export {
    SUPPORT_LANG,
    LANG_DICT,
    emptyTranslation
}
export type {
    SupportLangKey
}
