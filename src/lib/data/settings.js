import { ref, watch } from 'vue'
import { settings } from '@/lib/data/data'
import { setKeyFalseDelete, sync } from '@/lib/utils/tool'

const defaultSettings = {
    background: '#303030',
    width: 400,
    scale: 1.5,
    showCharName: false,
    showCharNameSettings: {
        chat: true,
        monologue: true,
        image: true
    },
    maxHeight: 16000,
    autoCut: true,
    watermark: true,
    author: '',
    characterSelectorPermanent: true
}
const syncedSettings = ref({})

sync(syncedSettings.value, defaultSettings, settings.value)
watch(settings, () => sync(syncedSettings.value, defaultSettings, settings.value), { deep: true })

function setSettings (value, key) {
    setKeyFalseDelete(settings.value, key, value)
}

export {
    defaultSettings,
    syncedSettings,
    setSettings
}
