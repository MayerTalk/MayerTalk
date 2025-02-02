// TODO typescript全部转化完后重构

import { computed, ref, watch } from 'vue'
import { config, settings } from '@/lib/data/data'
import { setKeyFalseDelete, sync } from '@/lib/utils/tool'

const defaultSettings = {
    width: 400,
    imageQuality: 1,
    maxHeight: 16000,
    autoCut: true,
    manualCut: true,
    watermark: true,
    author: '',
    characterSelectorPermanent: true
}

const commonSettings = ref({})
const editorSettings = ref({})
const rendererSettings = ref({})

const rawEditorSettings = computed(() => settings.value.editor[config.value.editor])
const rawRendererSettings = computed(() => settings.value.renderer[config.value.renderer])

function setCommonSettings(key, value, falseCheck = null) {
    setKeyFalseDelete(settings.value.common, key, value, falseCheck)
}

function setEditorSettings(key, value, falseCheck = null) {
    setKeyFalseDelete(rawEditorSettings.value, key, value, falseCheck)
}

function setRendererSettings(key, value, falseCheck = null) {
    setKeyFalseDelete(rawRendererSettings.value, key, value, falseCheck)
}

function enableSettingSync(dst, srcDefault, targetFn) {
    const _sync = () => {
        sync(dst, srcDefault, targetFn())
    }
    _sync()
    watch(targetFn, _sync, { deep: true })
}

enableSettingSync(commonSettings.value, defaultSettings, () => {
    return settings.value.common
})

export {
    defaultSettings,
    commonSettings,
    editorSettings,
    rendererSettings,
    rawEditorSettings,
    rawRendererSettings,
    setCommonSettings,
    setEditorSettings,
    setRendererSettings,
    enableSettingSync
}
