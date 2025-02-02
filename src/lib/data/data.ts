import type { ComputedRef, Ref } from 'vue'
import { computed, ref } from 'vue'
import { t } from '@/lib/lang/translate'
import { defaultLang } from '@/lib/lang/detect'
import { StaticUrl } from '@/lib/data/constance'
import message from '@/lib/utils/message'
import { blob2base64, bool, copy, md5, Textarea, uuid } from '@/lib/utils/tool'
import DataBase from '../utils/db'
import Hook from '@/lib/utils/hook'
import type * as DT from '@/lib/data/dataTypes';
import type { CharsRecord } from '@/lib/data/dataTypes';

// TODO refactor
const defaultSettings = { common: {}, editor: { Default: {} }, renderer: { Siracusa: {} } }

const config: Ref<DT.ConfigData> = ref({ editor: 'Default', renderer: 'Siracusa', lang: defaultLang })
const settings: Ref<DT.SettingsData> = ref(copy(defaultSettings))
const chars: Ref<DT.CharsData> = ref({})
const chats: Ref<DT.ChatsData> = ref([])
const images: Ref<DT.ImagesData> = ref({})
const avatars: Ref<{ [id: string]: ComputedRef<string> }> = ref({})
const currCharId: Ref<string | null> = ref(null)
const currCharData: Ref<CharsRecord | null> = ref(null)
const currDialogueIndex: Ref<number> = ref(0)
const currDialogueData: Ref<DT.ChatsRecord | null> = ref(null)


const Data = {
    config,
    settings,
    chars,
    chats,
    images
}

class Storage<T extends object> {
    key: DT.StorageKey
    obj: Ref<T>
    lastSave: string
    update: boolean

    constructor(key: DT.StorageKey, obj: Ref<T>) {
        this.key = key
        this.obj = obj
        this.lastSave = JSON.stringify(obj.value)
        this.update = false
    }

    save(force?: boolean): DT.OperateRecord | false | undefined {
        if (this.update || force) {
            this.update = false
            const lastSave = this.lastSave;
            const dataStr = JSON.stringify(this.obj.value, (key, value) => {
                if (typeof value === 'function') return undefined; // 过滤函数
                return value;
            });
            if (dataStr === lastSave) {
                return false
            }
            localStorage.setItem('data.' + this.key, dataStr)
            this.lastSave = dataStr
            return {
                key: this.key,
                new: dataStr,
                old: lastSave,
                type: 'modify'
            }
        }
    }

    load(): [T, (newData?: T) => boolean] | undefined {
        try {
            const dataStr = localStorage.getItem('data.' + this.key)
            const data: T = dataStr ? JSON.parse(dataStr) : copy(this.obj.value)
            return [data, (newData?: T) => {
                const currData = newData || data
                if (bool(currData)) {
                    this.obj.value = currData
                    this.lastSave = JSON.stringify(currData)
                    this.update = false
                    return true
                } else {
                    return false
                }
            }]
        } catch {
        }
    }

    set(data: T) {
        this.obj.value = data
    }
}

class ImageStorage {
    key: string
    obj: Ref<DT.ImagesData>
    lastSave: string
    update: boolean
    db: DataBase<DT.ImagesRecord>
    loadedCallback?: (data: DT.ImagesData, next: () => void) => void


    constructor(key: string, obj: Ref<DT.ImagesData>) {
        this.key = key
        this.obj = obj
        this.lastSave = JSON.stringify(obj.value)
        this.update = false
        this.db = new DataBase('data', 'images')
        this.db.open((event) => {
            const target = event.target as IDBOpenDBRequest
            const conn = target.result
            if (!conn.objectStoreNames.contains('images')) {
                conn.createObjectStore('images', { keyPath: 'id' })
            }
        }, () => {
            this.load()
        })
        this.loadedCallback = undefined
    }

    save(force?: boolean) {
        if (this.update || force) {
            this.update = false
            const lastSave = this.lastSave
            const dataStr = JSON.stringify(this.obj.value)
            if (dataStr === lastSave) {
                return false
            }
            this.lastSave = dataStr
            return {
                key: this.key,
                new: dataStr,
                old: lastSave,
                type: 'modify'
            }
        }
    }

    load(): void {
        try {
            const data = {} as DT.ImagesData
            this.db.transaction().openCursor().onsuccess = (event) => {
                const cursor: IDBCursorWithValue | null = (event.target as IDBRequest<IDBCursorWithValue>).result
                if (cursor) {
                    data[cursor.value.id] = { count: cursor.value.count, src: cursor.value.src }
                    cursor.continue()
                } else {
                    if (this.loadedCallback) {
                        this.loadedCallback(
                            data, () => {
                                this.lastSave = JSON.stringify(data)
                                this.obj.value = data
                                this.update = false
                            }
                        )
                    } else {
                        this.lastSave = JSON.stringify(data)
                        this.obj.value = data
                        this.update = false
                    }
                }
            }
        } catch {
        }
    }

    set(data: DT.ImagesData, internal = false) {
        const tmp = copy(data)
        if (!internal) {
            for (const imageId in tmp) {
                if (Object.prototype.hasOwnProperty.call(tmp, imageId)) {
                    if (Object.prototype.hasOwnProperty.call(tmp[imageId], 'src')) {
                        if (tmp[imageId].src.indexOf('data:') !== 0) {
                            // 非avatar/(内置)和data:image(b64)视为不安全数据
                            message.confirm(t.value.tip.unsafeImage + imageId + '）', t.value.noun.warning)
                            delete tmp[imageId]
                            throw TypeError
                        }
                    } else if (
                        (tmp[imageId] as unknown as string).indexOf('data:') !== 0) {
                        // 老数据适配
                        // 非avatar/(内置)和data:image(b64)视为不安全数据
                        message.confirm(t.value.tip.unsafeImage + imageId + '）', t.value.noun.warning)
                        delete tmp[imageId]
                        throw TypeError
                    }
                }
            }
        }
        this.obj.value = tmp
        this.sync()
    }

    sync() {
        // 将内存数据同步到indexDB
        this.db.clear(() => {
            for (const key in this.obj.value) {
                if (Object.prototype.hasOwnProperty.call(this.obj.value, key)) {
                    this.db.add({ id: key, ...this.obj.value[key] })
                }
            }
        })
    }

    new(blob: Blob, callback: (id?: string) => void) {
        blob2base64(blob, (b64) => {
            if (b64) {
                const id = md5(b64)
                if (Object.prototype.hasOwnProperty.call(images.value, id)) {
                    this.db.put({ id, count: ++images.value[id].count, src: b64 })
                } else {
                    images.value[id] = { count: 1, src: b64 }
                    this.db.add({ id, count: 1, src: b64 })
                }
                DataControl.update('images')
                if (callback) {
                    callback(id)
                }
            } else {
                if (callback) {
                    callback(undefined)
                }
            }
        })
    }

    delete(id: string) {
        if (Object.prototype.hasOwnProperty.call(images.value, id)) {
            if (--images.value[id].count < 1) {
                delete images.value[id]
                this.db.delete(id)
            } else {
                this.db.put({ id, ...images.value[id] })
            }
            DataControl.update('images')
        }
    }

    count(id: string) {
        if (Object.prototype.hasOwnProperty.call(images.value, id)) {
            images.value[id].count++
            this.db.put({ id, ...images.value[id] })
        }
    }
}


interface DataControlHooks {
    update: Hook;
    switch: Hook;
    clear: Hook<Array<string> | undefined>;
    changeSavefile: Hook;
    change: Hook;
}

const DataControl = new class DataControl {
    storage: DT.StorageType
    images: ImageStorage
    // storage.images的别名

    version: Array<Array<DT.OperateRecord>>
    index: number
    hook: DataControlHooks
    char: {
        new: (id: DT.CharsRecord) => string,
        delete: (id: string) => void
    }
    curr: {
        setChar: (id: string, force?: boolean) => boolean,
        setDialogue: (index: number) => void
    }

    constructor() {
        this.storage = {} as DT.StorageType
        this.images = undefined!
        this.version = []
        this.index = -1
        this.hook = {
            update: new Hook(),
            switch: new Hook(),
            clear: new Hook(),
            changeSavefile: new Hook(),
            change: new Hook((self, fn) => {
                const cancel = [
                    this.hook.update.on(fn),
                    this.hook.switch.on(fn),
                    this.hook.clear.on(fn as (params: Array<string> | undefined) => void),
                    this.hook.changeSavefile.on(fn)
                ]
                return () => {
                    cancel.forEach((x) => {
                        x()
                    })
                }
            })
        }
        this.char = {
            new: (data) => {
                data = copy(data)
                const id = uuid()
                chars.value[id] = data
                avatars.value[id] = computed(() => {
                    const avatar = chars.value[id].avatar
                    return Object.prototype.hasOwnProperty.call(images.value, avatar) ? images.value[avatar].src : StaticUrl + avatar
                })
                return id
            },
            delete: (id) => {
                this.images!.delete(chars.value[id].avatar)
                delete chars.value[id]
                for (let i = chats.value.length - 1; i > -1; i--) {
                    if (chats.value[i].char === id) {
                        chats.value.splice(i, 1)
                        this.update('chats')
                    }
                }
            }
        }
        this.curr = {
            setChar: (id, force = false) => {
                // 非force一般表示用户主动切换(或创建角色)
                if (id !== currCharId.value || force) {
                    currCharId.value = id
                    currCharData.value = chars.value[id]
                } else {
                    currCharId.value = ''
                    currCharData.value = null
                }
                if (!force) {
                    Textarea.focus()
                }
                return id !== currCharId.value
            },
            setDialogue: (index) => {
                currDialogueIndex.value = index
                currDialogueData.value = chats.value[index]
            }
        }

        for (const key in Data) {
            if (Object.prototype.hasOwnProperty.call(Data, key)) {
                if (key === 'images') {
                    const storage = new ImageStorage(key, Data[key])
                    this.storage[key] = storage
                    this.images = storage
                } else {
                    this.storage[key] = new Storage(key as DT.StorageKey, Data[key])
                }
            }
        }
    }

    update(update: DT.StorageKey | Array<DT.StorageKey>) {
        // 设置更新节点
        if (typeof update === 'string') {
            if (Object.prototype.hasOwnProperty.call(this.storage, update)) {
                this.storage[update].update = true
            } else {
                console.warn('[DataControl] not exist storage \'' + update + '\'')
            }
        } else {
            for (let i = 0; i < update.length; i++) {
                if (Object.prototype.hasOwnProperty.call(this.storage, update[i])) {
                    this.storage[update[i]].update = true
                } else {
                    console.warn('[DataControl] not exist storage \'' + update[i] + '\'')
                }
            }
        }
    }

    save(update?: DT.StorageKey | Array<DT.StorageKey>) {
        // 保存更新节点，用于撤回/重做
        if (this.index > -1) {
            this.version.splice(0, this.index + 1)
            this.index = -1
        }
        if (update) {
            this.update(update)
        }
        const operator: Array<DT.OperateRecord> = []
        for (const key in this.storage) {
            if (Object.prototype.hasOwnProperty.call(this.storage, key)) {
                const result = this.storage[key as DT.StorageKey].save()
                if (result) {
                    operator.push(result as DT.OperateRecord)
                }
            }
        }

        if (operator.length > 0) {
            this.version.unshift(operator)
            // 因为只有save才会作将数据为一个节点保存在本地，所以在此处调用hook
            this.hook.update.call(undefined)
        }
    }

    genCharSrc() {
        // 生成角色可用的头像链接
        for (const key in chars.value) {
            if (Object.prototype.hasOwnProperty.call(chars.value, key)) {
                avatars.value[key] = computed(() => {
                    const avatar = chars.value[key].avatar
                    return Object.prototype.hasOwnProperty.call(images.value, avatar) ? images.value[avatar].src : StaticUrl + avatar
                })
            }
        }
    }

    load(upgradeData?: (data: DT.DataType, next: Partial<Record<DT.StorageKey, () => void>>) => void) {
        // upgradeData: 交由版本控制进行处理，对旧数据进行升级，再使用n函数设置
        // 当储存版本与最新版本相同时，直接读取数据
        const data: Partial<DT.DataType> = {}
        const next: Partial<Record<DT.StorageKey, () => void>> = {}
        for (const key in this.storage) {
            if (Object.prototype.hasOwnProperty.call(this.storage, key)) {
                if (key !== 'images') {
                    const res = this.storage[key as DT.StorageKey].load()
                    if (res) {
                        const [d, n] = res
                        data[key] = d
                        next[key] = n
                        n()
                    }
                }
            }
        }
        this.storage.images.loadedCallback = (d, n) => {
            data.images = d
            next.images = n
            n()
        }

        if (upgradeData) {
            upgradeData(data as DT.DataType, next)
        }
        this.genCharSrc()
    }

    set(data: Partial<DT.DataType>, internal = false) {
        for (const key in this.storage) {
            if (Object.prototype.hasOwnProperty.call(this.storage, key) && Object.prototype.hasOwnProperty.call(data, key)) {
                this.storage[key].set(data[key], internal)
                this.storage[key].update = true
            }
        }
        this.hook.update.call(undefined)
        this.genCharSrc()
    }

    withdraw() {
        if (this.index + 1 < this.version.length) {
            const data = this.version[++this.index]
            for (let i = 0; i < data.length; i++) {
                const operator = data[i]
                if (Object.prototype.hasOwnProperty.call(this.storage, operator.key)) {
                    if (operator.type === 'modify') {
                        const storage = this.storage[operator.key]
                        storage.set(JSON.parse(operator.old), true)
                        storage.save(true)
                    }
                }
            }
            this.hook.switch.call(undefined)
        }
    }

    redo() {
        if (this.index > -1) {
            const data = this.version[this.index--]
            for (let i = 0; i < data.length; i++) {
                const operator = data[i]
                if (Object.prototype.hasOwnProperty.call(this.storage, operator.key)) {
                    if (operator.type === 'modify') {
                        const storage = this.storage[operator.key]
                        storage.set(JSON.parse(operator.new), true)
                        storage.save(true)
                    }
                }
            }
            this.hook.switch.call(undefined)
        }
    }

    clear(params: Array<string>) {
        this.hook.clear.call(params)
        const needSave: Array<DT.StorageKey> = []
        if (params.indexOf('chars') !== -1) {
            // 清空角色
            // 由于对话与角色绑定，所以默认也清除对话
            chars.value = {}
            chats.value = []
            this.images.set({})
            needSave.push('chars', 'chats', 'images')
        } else if (params.indexOf('chats') !== -1) {
            // 清空对话
            for (let i = 0; i < chats.value.length; i++) {
                const chat = chats.value[i]
                if (chat.type === 'image') {
                    this.images.delete(chat.content)
                }
            }
            chats.value = []
            needSave.push('chats', 'images')
        }
        if (params.indexOf('settings') !== -1) {
            settings.value = copy(defaultSettings)
            needSave.push('settings')
        }
        if (params.indexOf('savefile') !== -1) {
            // 利用ClearHook传递给savefile.js处理
            // 备忘用
        }
        this.save(needSave)
        message.notify(t.value.notify.emptiedSuccessfully, message.success)
    }

    reset() {
        localStorage.clear()
        indexedDB.deleteDatabase('data')
        indexedDB.deleteDatabase('savefile')
    }
}

document.addEventListener('keydown', event => {
    if ((event.ctrlKey && ['TEXTAREA', 'INPUT'].indexOf((event.target as HTMLElement).nodeName) === -1) || event.altKey) {
        if (event.code === 'KeyZ') {
            if (event.shiftKey) {
                DataControl.redo()
            } else {
                DataControl.withdraw()
            }
            event.preventDefault()
        } else if (event.code === 'KeyY') {
            DataControl.redo()
            event.preventDefault()
        }
    }
})

DataControl.hook.switch.on(() => {
    if (!currCharId.value || !Object.prototype.hasOwnProperty.call(chars.value, currCharId.value)) {
        DataControl.curr.setChar('', true)
    }
})

export {
    defaultSettings,
    config,
    settings,
    chats,
    chars,
    images,
    avatars,
    currCharId,
    currCharData,
    currDialogueIndex,
    currDialogueData,
    Storage,
    ImageStorage,
    DataControl
}
