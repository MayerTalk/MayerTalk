import { computed, ref, type Ref } from 'vue'

import { withDefault, excludeDefault } from '@/lib/utils/tool'

import { currRendererRef } from '@/lib/data/state'
import { settings, DataControl } from '@/lib/data/data'

interface GenericSettings {
    width: number
    imageQuality: number
    maxHeight: number
    autoCut: boolean
    manualCut: boolean
    watermark: boolean
    author: string
}

export interface RendererGenericSettings {
    background: string
}

const DEFAULT_GENERIC_SETTINGS: Readonly<GenericSettings> = {
    width: 400,
    imageQuality: 1,
    maxHeight: 16000,
    autoCut: true,
    manualCut: true,
    watermark: true,
    author: '',
}

interface SettingsOptions<T> {
    type: 'generic' | 'editor' | 'renderer',
    key?: string
    default: T
}

class SettingsManager<T extends object> {
    type: 'generic' | 'editor' | 'renderer'
    key: string
    default: T
    ref: Ref<T>
    hookCancels: Array<() => void>

    constructor(options: SettingsOptions<T>) {
        this.type = options.type
        this.key = options.key || ''
        this.default = options.default
        this.ref = ref(null) as unknown as Ref<T>
        this.syncSettings()
        this.hookCancels = []
    }

    getRawSettings(): object {
        if (this.type === 'generic') {
            return settings.value.generic
        } else {
            return settings.value[this.type][this.key] || {}
        }
    }

    syncSettings(): void {
        // 从localStorage中读取settings，并填充默认值
        this.ref.value = withDefault<T>(this.getRawSettings(), this.default)
    }

    saveSettings(): void {
        // TODO 优化类型提示
        const value = excludeDefault(this.ref.value as object, this.default as object)
        if (this.type === 'generic') {
            settings.value.generic = value
        } else {
            settings.value[this.type][this.key] = value as object
        }
    }

    mount() {
        // 目前settingsManager在<components>/index.ts中使用，需要组件控制其生命周期
        // 用途：收到保存settings事件时，自动保存settings

        this.hookCancels.push(DataControl.hook.beforeUpdate.on((params) => {
            if (params.indexOf('settings') !== -1) {
                this.saveSettings()
            }
        }))
        this.hookCancels.push(DataControl.hook.switch.on(() => {
            // TODO 多component时验证syncSettings逻辑
            this.syncSettings()
        }))
        this.syncSettings()
    }

    unmount() {
        this.hookCancels.forEach(fn => {
            fn()
        })
    }
}

const GenericSettingsManager = new SettingsManager<GenericSettings>({
    type: 'generic',
    default: DEFAULT_GENERIC_SETTINGS
})
GenericSettingsManager.mount() // 挂载通用设置

const genericSettings = GenericSettingsManager.ref
const currRendererSettings = computed<RendererGenericSettings>(() => {
    if (currRendererRef.value) {
        return currRendererRef.value.rendererSettings
    } else {
        return {
            background: ''
        }
    }
})


export {
    DEFAULT_GENERIC_SETTINGS,
    SettingsManager,
    GenericSettingsManager,
    genericSettings,
    currRendererSettings
}
