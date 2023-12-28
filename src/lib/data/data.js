import { ref, computed } from 'vue'
import { t } from '@/lib/lang/translate'
import { defaultLang } from '@/lib/lang/detect'
import { StaticUrl } from '@/lib/data/constance'
import message from '@/lib/utils/message'
import { copy, blob2base64, md5, uuid, Textarea, bool } from '@/lib/utils/tool'
import DataBase from '../utils/db'

const config = ref({ editor: 'Default', renderer: 'Siracusa', lang: defaultLang })
const settings = ref({})
const chars = ref({})
const chats = ref([])
const images = ref({})
const avatars = ref({})
const currCharId = ref('')
const currCharData = ref({})
const currDialogueIndex = ref(0)
const currDialogueData = ref({})

const Data = {
    config,
    settings,
    chars,
    chats,
    images
}

const Storage = class Storage {
    constructor (key, obj) {
        this.key = key
        this.obj = obj
        this.lastSave = JSON.stringify(obj.value)
        this.update = false
        // TODO doesn't work
        // watch(this.obj, () => {
        //     this.update = true
        // })
    }

    save (force) {
        if (this.update || force) {
            this.update = false
            const lastSave = this.lastSave
            const dataStr = JSON.stringify(this.obj.value)
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

    load () {
        try {
            const dataStr = localStorage.getItem('data.' + this.key)
            const data = JSON.parse(dataStr) || copy(this.obj.value)
            return [data, (newData = null) => {
                const currData = newData || data
                if (bool(currData)) {
                    this.obj.value = currData
                    this.lastSave = JSON.stringify(currData)
                    this.update = false
                    return true
                }
            }]
        } catch (e) {
        }
        return false
    }

    set (data) {
        this.obj.value = data
    }
}

const ImageStorage = class ImageStorage {
    constructor (key, obj) {
        this.key = key
        this.obj = obj
        this.lastSave = JSON.stringify(obj.value)
        this.update = false
        this.db = new DataBase('data', 'images')
        this.db.open((event) => {
            const db = event.target.result
            if (!db.objectStoreNames.contains('images')) {
                db.createObjectStore('images', { keyPath: 'id' })
            }
        }, () => {
            this.load()
        })
        this.loadedCallback = null
    }

    save (force) {
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

    load () {
        try {
            const data = {}
            this.db.transaction().openCursor().onsuccess = (event) => {
                const cursor = event.target.result
                if (cursor) {
                    data[cursor.value.id] = { count: cursor.value.count, src: cursor.value.src }
                    cursor.continue()
                } else {
                    if (this.loadedCallback) {
                        this.loadedCallback(
                            [data, () => {
                                this.lastSave = JSON.stringify(data)
                                this.obj.value = data
                                this.update = false
                            }]
                        )
                    } else {
                        this.lastSave = JSON.stringify(data)
                        this.obj.value = data
                        this.update = false
                    }
                }
            }
        } catch (e) {
        }
        return false
    }

    set (data, internal = false) {
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
                        tmp[imageId].indexOf('data:') !== 0) {
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

    sync () {
        // 将内存数据同步到indexDB
        this.db.clear(() => {
            for (const key in this.obj.value) {
                if (Object.prototype.hasOwnProperty.call(this.obj.value, key)) {
                    this.db.add({ id: key, ...this.obj.value[key] })
                }
            }
        })
    }

    new (blob, callback) {
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
                callback && callback(id)
            } else {
                callback && callback(null)
            }
        })
    }

    delete (id) {
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

    count (id) {
        if (Object.prototype.hasOwnProperty.call(images.value, id)) {
            images.value[id].count++
            this.db.put({ id, ...images.value[id] })
        }
    }
}

const DataControl = {
    storage: {},
    version: [],
    index: -1,
    updateHooks: [],
    callUpdateHook () {
        this.updateHooks.forEach((fn) => {
            fn()
        })
    },
    onUpdate (fn) {
        // 内容更新
        this.updateHooks.push(fn)
    },
    switchHooks: [],
    callSwitchHook () {
        this.switchHooks.forEach((fn) => {
            fn()
        })
    },
    onSwitch (fn) {
        // withdraw or redo
        this.switchHooks.push(fn)
    },
    onChange (fn) {
        this.onUpdate(fn)
        this.onSwitch(fn)
        this.onChangeSavefile(fn)
        this.onClear(fn)
    },
    clearHooks: [],
    callClearHook (level) {
        this.clearHooks.forEach((fn) => {
            fn(level)
        })
    },
    onClear (fn) {
        this.clearHooks.push(fn)
    },
    changeSavefileHooks: [],
    onChangeSavefile (fn) {
        this.changeSavefileHooks.push(fn)
    },
    callChangeSavefileHook () {
        this.changeSavefileHooks.forEach((fn) => {
            fn()
        })
    },
    update (update) {
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
    },
    save (update) {
        if (this.index > -1) {
            this.version.splice(0, this.index + 1)
            this.index = -1
        }
        update && this.update(update)
        const operator = []
        for (const key in this.storage) {
            if (Object.prototype.hasOwnProperty.call(this.storage, key)) {
                const r = this.storage[key].save()
                if (r) {
                    operator.push(r)
                }
            }
        }

        if (operator.length > 0) {
            this.version.unshift(operator)
            // 因为只有save才会作将数据为一个节点保存在本地，所以在此处调用hook
            this.callUpdateHook()
        }
    },
    genCharSrc () {
        for (const key in chars.value) {
            if (Object.prototype.hasOwnProperty.call(chars.value, key)) {
                avatars.value[key] = computed(() => {
                    const avatar = chars.value[key].avatar
                    return Object.prototype.hasOwnProperty.call(images.value, avatar) ? images.value[avatar].src : StaticUrl + avatar
                })
            }
        }
    },
    load (callback) {
        const data = {}
        const next = {}
        for (const key in this.storage) {
            if (Object.prototype.hasOwnProperty.call(this.storage, key)) {
                if (key !== 'images') {
                    const [d, n] = this.storage[key].load()
                    data[key] = d
                    next[key] = n
                    n()
                }
            }
        }
        this.storage.images.loadedCallback = (res) => {
            const [d, n] = res
            data.images = d
            next.images = n
            n()
            callback && callback(data, next)
        }
        this.genCharSrc()
    },
    set (data, internal = false) {
        for (const key in this.storage) {
            if (Object.prototype.hasOwnProperty.call(this.storage, key) && Object.prototype.hasOwnProperty.call(data, key)) {
                this.storage[key].set(data[key], internal)
                this.storage[key].update = true
            }
        }
        this.callUpdateHook()
        this.genCharSrc()
    },
    withdraw () {
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
            this.callSwitchHook()
        }
    },
    redo () {
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
            this.callSwitchHook()
        }
    },
    clear (level) {
        this.callClearHook(level)
        if (level === 0) {
            // 清空对话
            for (let i = 0; i < chats.value.length; i++) {
                const chat = chats.value[i]
                if (chat.type === 'image') {
                    this.image.delete(chat.content)
                }
            }
            chats.value = []
            message.notify(t.value.notify.emptiedSuccessfully, message.success)
            this.save(['chats', 'images'])
        } else if (level === 1) {
            // 清空对话 + 角色
            chars.value = {}
            chats.value = []
            images.value = {}
            message.notify(t.value.notify.emptiedSuccessfully, message.success)
            this.save(['chars', 'chats', 'images'])
        } else if (level === 2) {
            // 清空本地数据
            localStorage.clear()
            indexedDB.deleteDatabase('data')
            indexedDB.deleteDatabase('savefile')
        }
    },
    char: {
        new (data) {
            data = copy(data)
            const id = uuid()
            chars.value[id] = data
            avatars.value[id] = computed(() => {
                const avatar = chars.value[id].avatar
                return Object.prototype.hasOwnProperty.call(images.value, avatar) ? images.value[avatar].src : StaticUrl + avatar
            })
            return id
        },
        delete (id) {
            DataControl.image.delete(chars.value[id].avatar)
            delete chars.value[id]
            for (let i = chats.value.length - 1; i > -1; i--) {
                if (chats.value[i].char === id) {
                    chats.value.splice(i, 1)
                    DataControl.update('chats')
                }
            }
        }
    },
    image: null,
    curr: {
        setChar (id, force = false) {
            // 非force一般表示用户主动切换(或创建角色)
            if (id !== currCharId.value || force) {
                currCharId.value = id
                currCharData.value = chars.value[id]
            } else {
                currCharId.value = ''
                currCharData.value = {}
            }
            if (!force) {
                Textarea.focus()
            }
            return id !== currCharId.value
        },
        setDialogue (index) {
            currDialogueIndex.value = index
            currDialogueData.value = chats.value[index]
        }
    }
}

for (const key in Data) {
    if (Object.prototype.hasOwnProperty.call(Data, key)) {
        if (key === 'images') {
            const storage = new ImageStorage(key, Data[key])
            DataControl.storage[key] = storage
            DataControl.image = storage
        } else {
            DataControl.storage[key] = new Storage(key, Data[key])
        }
    }
}

document.addEventListener('keydown', event => {
    if ((event.ctrlKey && ['TEXTAREA', 'INPUT'].indexOf(event.target.nodeName) === -1) || event.altKey) {
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

DataControl.onSwitch(() => {
    if (!Object.prototype.hasOwnProperty.call(chars.value, currCharId.value)) {
        DataControl.curr.setChar('', true)
    }
})

export {
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
