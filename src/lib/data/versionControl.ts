import { t } from '@/lib/lang/translate'
import { defaultLang } from '@/lib/lang/detect'
import { getData, saveData, blob2url, download, md5, copy } from '@/lib/utils/tool'
import message from '@/lib/utils/message'
import {
    defaultSettings,
    config,
    chats,
    chars,
    images,
    settings,
    DataControl
} from '@/lib/data/data'

import type * as DT from '@/lib/data/dataTypes';

const latestVersion = 'g'
const initialVersion = 'a'
let currVersion = getData<string>('data.version') || initialVersion

interface VersionSwitcherOption {
    load?: boolean
}

const versionSwitcher: Record<string, (data: DT.DataType, opt: VersionSwitcherOption) => string> = {
    a: (data) => {
        // v0.0.5 -> v0.1.0 / a -> b
        // png2webp / image ref / char.src (computed)
        const tmp: DT.ImagesData = {}
        const change: { [oldKey: string]: string } = {}
        const images = data.images as unknown as { [oldKey: string]: string }
        for (const key in images) {
            if (Object.prototype.hasOwnProperty.call(images, key)) {
                const id = md5(images[key])
                change[key] = id
                if (Object.prototype.hasOwnProperty.call(tmp, id)) {
                    tmp[id].count++
                } else {
                    tmp[id] = {
                        count: 1,
                        src: images[key]
                    }
                }
            }
        }
        for (let i = 0; i < data.chats.length; i++) {
            const chat = data.chats[i]
            if (chat.type === 'image' && Object.prototype.hasOwnProperty.call(change, chat.content)) {
                // 更新版本a的image chat content
                chat.content = change[chat.content]
            }
        }
        for (const key in data.chars) {
            if (Object.prototype.hasOwnProperty.call(data.chars, key)) {
                const char = data.chars[key]
                if (Object.prototype.hasOwnProperty.call(change, char.avatar)) {
                    char.avatar = change[char.avatar]
                }
            }
        }
        data.images = tmp
        return 'b'
    },
    b: (data, opt) => {
        if (opt.load) {
            // v0.1.0 -> v0.1.1 / b -> c
            // indexDB
            const dataStr = localStorage.getItem('data.images')
            if (dataStr) {
                data.images = JSON.parse(dataStr)
                DataControl.images.sync()
                localStorage.removeItem('data.images')
            }
        }
        return 'c'
    },
    c: (data, opt) => {
        // v0.1.6 -> v0.1.7 / c -> d
        // 编辑器/渲染器分离
        if (!Object.prototype.hasOwnProperty.call(data.config, 'editor')) {
            data.config.editor = 'Default'
        }
        if (!Object.prototype.hasOwnProperty.call(data.config, 'renderer') || data.config.renderer === 'Arknights') {
            data.config.renderer = 'Siracusa'
        }
        if (opt.load) {
            saveData('data.config', data.config)
        }
        return 'd'
    },
    d: (data, opt) => {
        // v0.1.8 -> v0.1.9 / d -> e
        // i18n & render -> renderer
        if (!Object.prototype.hasOwnProperty.call(data.config, 'lang')) {
            data.config.lang = defaultLang
        }
        if (!Object.prototype.hasOwnProperty.call(data.config, 'renderer')) {
            data.config.renderer = 'Siracusa'
        }
        if (Object.prototype.hasOwnProperty.call(data.config, 'render')) {
            delete (data.config as unknown as { render?: string }).render
        }
        if (opt.load) {
            saveData('data.config', data.config)
        }
        return 'e'
    },
    e: (data, opt) => {
        // v0.2.1 -> v0.2.2 / e -> f
        // dialogue.data
        data.chats.forEach((chatData) => {
            chatData.data = {}
        })
        if (opt.load) {
            saveData('data.chats', data.chats)
        }
        return 'f'
    },
    f: (data, opt) => {
        // v0.2.2 -> v0.2.3 / f -> g
        // settings
        const oldSettings = copy(data.settings)
        const newSettings = copy(defaultSettings)
        const commonKey = ['maxHeight', 'autoCut', 'manualCut', 'watermark', 'author', 'width']
        const editorKey = ['characterSelectorPermanent']
        const rendererKey = ['background', 'showCharName', 'showCharNameSettings']
        const group: Array<[Array<string>, object]> = [
            [commonKey, newSettings.common],
            [editorKey, newSettings.editor.Default],
            [rendererKey, newSettings.renderer.Siracusa]
        ]
        for (const key in oldSettings) {
            for (let i = 0; i < group.length; i++) {
                if (group[i][0].indexOf(key) !== -1) {
                    group[i][1][key] = oldSettings[key]
                }
            }
        }
        if (Object.prototype.hasOwnProperty.call(oldSettings, 'scale')) {

            (newSettings.common as unknown as {
                imageQuality: number
            }).imageQuality = +((oldSettings as unknown as { scale: number }).scale / 1.5).toFixed(2)
        }
        data.settings = newSettings
        if (opt.load) {
            saveData('data.settings', data.settings)
        }
        return 'g'
    }
}

function switchVersion(data: DT.DataType, opt?: VersionSwitcherOption) {
    let version = data.version || initialVersion
    while (version !== latestVersion) {
        try {
            version = versionSwitcher[version](data, opt || {})
        } catch {
            break
        }
    }
    currVersion = version
    saveData('data.version', version)
}

function getDataJson(full = false) {
    const data: Partial<DT.DataType> = {
        version: currVersion,
        config: config.value,
        chars: chars.value,
        chats: chats.value,
        images: images.value
    }
    if (full) {
        data.settings = settings.value
    }
    return copy(data)
}

function getDataString(full = false) {
    return JSON.stringify(getDataJson(full))
}

function downloadData() {
    const url = blob2url(new Blob([getDataString()], { type: 'application/json' }))
    download(url, 'mayertalk-data-' + Date.now() + '.json')
}

function uploadData(uploadFile: File, callback: () => void) {
    const reader = new FileReader()
    reader.onloadend = () => {
        try {
            if (typeof reader.result === 'string') {
                const data = JSON.parse(reader.result)
                switchVersion(data)
                DataControl.set(data, false)
                DataControl.save()
                message.notify(t.value.notify.importedSuccessfully, message.success)
                DataControl.hook.changeSavefile.call(undefined)
                if (callback) {
                    callback()
                }
            }

        } catch (e) {
            console.log(e)
            message.notify(t.value.tip.importFailed, message.error)
        }
    }
    reader.readAsText(uploadFile)
    return false
}

function loadData() {
    if (latestVersion === currVersion) {
        DataControl.load()
    } else {
        DataControl.load((data, next) => {
            if (data) {

            }
            data.version = currVersion
            switchVersion(data, {
                load: true
            })
            Object.entries(next).forEach((obj) => {
                obj[1]()
            })
        })
    }
}

loadData()

export {
    initialVersion,
    switchVersion,
    getDataJson,
    getDataString,
    uploadData,
    downloadData
}
