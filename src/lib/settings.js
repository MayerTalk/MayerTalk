import { ref, watch } from 'vue'
import { settings } from '@/lib/data'
import { sync } from '@/lib/tool'

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
    if (value) {
        settings.value[key] = value
    } else {
        delete settings.value[key]
    }
}

export {
    defaultSettings,
    syncedSettings,
    setSettings
}
