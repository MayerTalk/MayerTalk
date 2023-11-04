import { ref } from 'vue'

import { saveData, getData } from '@/lib/tool'
import { cacheRequest } from '@/lib/cacheRequest'
import { emptyTranslation } from '@/lib/lang/constant'
import { translationHost } from '@/lib/dev'
import tipControl from '@/lib/tip'

const cacheKey = 'cache.data.translation.'
const config = getData('data.config') || { lang: 'zh_CN' }

const translate = ref({})

function setTranslation (data) {
    translate.value = data
    tipControl.setTips(data.tip.pool)
}

function updateTranslation (lang, firstUpdate = false, retry = true) {
    if (firstUpdate || getData(cacheKey + lang)) {
        setTranslation(getData(cacheKey + lang) || emptyTranslation)
    }
    cacheRequest('translation/' + lang, 'translation.' + lang, (result, success) => {
        if (!success) {
            retry && setTimeout(() => {
                updateTranslation(lang, firstUpdate, false)
            }, 100)
        }
        setTranslation(result.data)
        saveData(cacheKey + lang, result.data)
    }, null, !getData(cacheKey + lang), translationHost)
}

updateTranslation(config.lang, true)

setTimeout(() => {
    if (translate.value.empty) {
        // retry
        updateTranslation(config.lang, true)
    }
}, 1000)

export {
    translate as t,
    updateTranslation
}
