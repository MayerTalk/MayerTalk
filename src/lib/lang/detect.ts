const langDict = {
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
}

let defaultLang:string = ''

for (const lang of navigator.languages) {
    if (Object.prototype.hasOwnProperty.call(langDict, lang)) {
        defaultLang = langDict[lang]
        break
    } else if (Object.prototype.hasOwnProperty.call(langDict, lang.split('-')[0])) {
        defaultLang = langDict[lang.split('-')[0]]
        break
    }
}

if (!defaultLang) {
    defaultLang = 'en_US'
}

export {
    defaultLang
}
