import { ref } from 'vue'
import type { Ref } from 'vue'

import { saveData, getData } from '@/lib/utils/tool'
import { cacheRequest } from '@/lib/utils/cacheRequest'
import { emptyTranslation } from '@/lib/lang/constant'
import { translationHost } from '@/lib/dev'
import tipControl from '@/lib/function/tip'
import type { Translation } from '@/lib/lang/translation';

const cacheKey = 'cache.data.translation.'
const config = getData<{ lang: string }>('data.config') || { lang: 'zh_CN' }

const translate: Ref<Translation> = ref({}) as Ref<Translation>

function setTranslation(data: Translation) {
    translate.value = data
    tipControl.setTips(data.tip.pool)
}

function updateTranslation(lang: string, firstUpdate = false, retry = true) {
    if (firstUpdate || getData<Translation>(cacheKey + lang)) {
        setTranslation(getData<Translation>(cacheKey + lang) || emptyTranslation)
    }
    cacheRequest<Translation>({
        url: 'translation/' + lang,
        key: 'translation.' + lang,
        success: (resp) => {
            setTranslation(resp.data)
            saveData(cacheKey + lang, resp.data)
        },
        error: () => {
            if (retry) {
                setTimeout(() => {
                    updateTranslation(lang, firstUpdate, false)
                }, 100)
            }
        },
        host: translationHost
    })
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
