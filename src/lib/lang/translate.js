import { ref } from 'vue'
import { saveData, getData } from '@/lib/tool'
import { cacheRequest } from '@/lib/cacheRequest'
import { emptyTranslation } from '@/lib/lang/constant'
import tipControl from '@/lib/tip'

const cacheKey = 'cache.data.translation.'
const config = getData('data.config') || { lang: 'zh_CN' }

const translate = ref({})

function setTranslation (data) {
    translate.value = data
    tipControl.setTips(data.tip.pool)
}

function updateTranslation (lang, firstUpdate = false) {
    if (firstUpdate || getData(cacheKey + lang)) {
        setTranslation(getData(cacheKey + lang) || emptyTranslation)
    }
    cacheRequest('translation/' + lang, 'translation.' + lang, (result) => {
        setTranslation(result.data)
        saveData(cacheKey + lang, result.data)
    }, null, !getData(cacheKey + lang))
}

updateTranslation(config.lang, true)

export {
    translate as t,
    updateTranslation
}
