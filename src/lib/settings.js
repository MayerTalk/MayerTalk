import { ref, watch } from 'vue'
import { settings } from '@/lib/data'
import { sync } from '@/lib/tool'

const defaultSettings = {
    background: '#303030',
    width: 400,
    style: 'default',
    scale: 1.5,
    showCharName: false,
    showCharNameSettings: {
        chat: true,
        monologue: true,
        image: true
    },
    maxHeight: 16000
}
const syncedSettings = ref({})

sync(syncedSettings.value, defaultSettings, settings.value)
watch(settings, () => sync(syncedSettings.value, defaultSettings, settings.value), { deep: true })

export {
    defaultSettings,
    syncedSettings
}
