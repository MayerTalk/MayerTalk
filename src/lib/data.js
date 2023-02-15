import {ref, computed} from 'vue'
import {StaticUrl} from '@/lib/constance';
import message from '@/lib/message'
import {copy, blob2base64, md5, uuid} from '@/lib/tool'

const config = ref({render: 'Arknights'});
const settings = ref({});
const chars = ref({});
const chats = ref([]);
const images = ref({});
const avatars = ref({});

const Data = {
    config,
    settings,
    chars,
    chats,
    images
};

const Storage = class Storage {
    constructor(key, obj) {
        this.key = key;
        this.obj = obj;
        this.lastSave = JSON.stringify(obj.value);
        this.update = false;
        // TODO doesn't work
        // watch(this.obj, () => {
        //     this.update = true
        // })
    }

    save(force) {
        if (this.update || force) {
            this.update = false;
            const lastSave = this.lastSave;
            const dataStr = JSON.stringify(this.obj.value);
            if (dataStr === lastSave) {
                return false
            }
            localStorage.setItem('data.' + this.key, dataStr);
            this.lastSave = dataStr;
            return {
                key: this.key,
                new: dataStr,
                old: lastSave,
                type: 'modify'
            }
        }
    }

    load() {
        try {
            const dataStr = localStorage.getItem('data.' + this.key);
            const data = JSON.parse(dataStr);
            return [data, () => {
                if (data) {
                    this.obj.value = data;
                    this.lastSave = dataStr;
                    this.update = false;
                    return true
                }
            }]
        } catch (e) {
        }
        return false
    }

    set(data) {
        this.obj.value = data
    }
};

const DataBase = class DataBase {
    constructor(dbname, table) {
        this.db = dbname;
        this.table = table;
        this.conn = null
    }

    open(onupgradeneeded, callback) {
        const request = window.indexedDB.open(this.db);
        request.onupgradeneeded = onupgradeneeded;
        request.onsuccess = (event) => {
            this.conn = request.result;
            callback && callback()
        }
    }

    transaction(mode = 'readonly') {
        return this.conn.transaction(this.table, mode).objectStore(this.table)
    }

    add(data) {
        return this.transaction('readwrite').add(data)
    }

    put(data) {
        return this.transaction('readwrite').put(data)
    }

    delete(key) {
        return this.transaction('readwrite').delete(key)
    }

    clear(success) {
        this.transaction('readwrite').clear().onsuccess = success
    }
};

const ImageStorage = class ImageStorage {
    constructor(key, obj) {
        this.key = key;
        this.obj = obj;
        this.lastSave = JSON.stringify(obj.value);
        this.update = false;
        this.db = new DataBase('data', 'images');
        this.db.open((event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('images')) {
                db.createObjectStore('images', {keyPath: 'id'})
            }
        }, () => {
            this.load()
        });
        this.loadedCallback = null
    }

    save(force) {
        if (this.update || force) {
            this.update = false;
            const lastSave = this.lastSave;
            const dataStr = JSON.stringify(this.obj.value);
            if (dataStr === lastSave) {
                return false
            }
            this.lastSave = dataStr;
            return {
                key: this.key,
                new: dataStr,
                old: lastSave,
                type: 'modify'
            }
        }
    }

    load() {
        try {
            const data = {};
            this.db.transaction().openCursor().onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    data[cursor.value.id] = {count: cursor.value.count, src: cursor.value.src};
                    cursor.continue()
                } else {
                    if (this.loadedCallback) {
                        this.loadedCallback(
                            [data, () => {
                                this.lastSave = JSON.stringify(data);
                                this.obj.value = data;
                                this.update = false
                            }]
                        )
                    } else {
                        this.lastSave = JSON.stringify(data);
                        this.obj.value = data;
                        this.update = false
                    }
                }
            }
        } catch (e) {
        }
        return false
    }

    set(data, internal = false) {
        const tmp = copy(data);
        if (!internal) {
            for (let imageId in tmp) {
                if (tmp.hasOwnProperty(imageId)) {
                    if (tmp[imageId].hasOwnProperty('src')) {
                        if (tmp[imageId].src.indexOf('data:') !== 0) {
                            // 非avatar/(内置)和data:image(b64)视为不安全数据
                            message.confirm('导入的文件有不安全图片，请核实来源（图片ID：' + imageId + '）', '警告');
                            delete tmp[imageId];
                            throw TypeError
                        }
                    } else if (
                        tmp[imageId].indexOf('data:') !== 0) {
                        // 老数据适配
                        // 非avatar/(内置)和data:image(b64)视为不安全数据
                        message.confirm('导入的文件有不安全图片，请核实来源（图片ID：' + imageId + '）', '警告');
                        delete tmp[imageId];
                        throw TypeError
                    }
                }
            }
        }
        this.obj.value = tmp;
        this.sync()
    }

    sync() {
        // 将内存数据同步到indexDB
        this.db.clear(() => {
            for (let key in this.obj.value) {
                if (this.obj.value.hasOwnProperty(key)) {
                    this.db.add({id: key, ...this.obj.value[key]})
                }
            }
        });
    }

    new(blob, callback) {
        blob2base64(blob, (b64) => {
            if (b64) {
                const id = md5(b64);
                if (images.value.hasOwnProperty(id)) {
                    this.db.put({id: id, count: ++images.value[id].count, src: b64})
                } else {
                    images.value[id] = {count: 1, src: b64};
                    this.db.add({id: id, count: 1, src: b64});
                }
                DataControl.update('images');
                callback && callback(id);
            } else {
                callback && callback(null)
            }
        });
    }

    delete(id) {
        if (images.value.hasOwnProperty(id)) {
            if (--images.value[id].count < 1) {
                delete images.value[id];
                this.db.delete(id)
            } else {
                this.db.put({id: id, ...images.value[id]})
            }
            DataControl.update('images')
        }
    }

    count(id) {
        if (images.value.hasOwnProperty(id)) {
            images.value[id].count++;
            this.db.put({id: id, ...images.value[id]})
        }
    }
};

const DataControl = {
    storage: {},
    version: [],
    index: -1,
    switchHook: null,
    update(update) {
        if (typeof update === "string") {
            if (this.storage.hasOwnProperty(update)) {
                this.storage[update].update = true
            } else {
                console.warn('[DataControl] not exist storage \'' + update + '\'')
            }
        } else {
            for (let i = 0; i < update.length; i++) {
                if (this.storage.hasOwnProperty(update[i])) {
                    this.storage[update[i]].update = true
                } else {
                    console.warn('[DataControl] not exist storage \'' + update[i] + '\'')
                }
            }
        }
    },
    save(update) {
        if (this.index > -1) {
            this.version.splice(0, this.index + 1);
            this.index = -1;
        }
        update && this.update(update);
        const operator = [];
        for (let key in this.storage) {
            if (this.storage.hasOwnProperty(key)) {
                const r = this.storage[key].save();
                if (r) {
                    operator.push(r)
                }
            }
        }

        if (operator.length > 0) {
            this.version.unshift(operator);
        }

    },
    genCharSrc() {
        for (let key in chars.value) {
            if (chars.value.hasOwnProperty(key)) {
                avatars.value[key] = computed(() => {
                    const avatar = chars.value[key].avatar;
                    return images.value.hasOwnProperty(avatar) ? images.value[avatar].src : StaticUrl + avatar
                });
            }
        }
    },
    load(callback) {
        const data = {};
        const next = {};
        for (let key in this.storage) {
            if (this.storage.hasOwnProperty(key)) {
                if (key !== 'images') {
                    const [d, n] = this.storage[key].load();
                    data[key] = d;
                    next[key] = n;
                    n();
                }
            }
        }
        this.storage.images.loadedCallback = (res) => {
            const [d, n] = res;
            data.images = d;
            next.images = n;
            n();
            callback && callback(data, next)
        };
        this.genCharSrc()
    },
    set(data) {
        for (let key in this.storage) {
            if (this.storage.hasOwnProperty(key) && data.hasOwnProperty(key)) {
                this.storage[key].set(data[key]);
                this.storage[key].update = true
            }
        }
        this.genCharSrc()
    },
    withdraw() {
        if (this.index + 1 < this.version.length) {
            const data = this.version[++this.index];
            for (let i = 0; i < data.length; i++) {
                const operator = data[i];
                if (this.storage.hasOwnProperty(operator.key)) {
                    if (operator.type === 'modify') {
                        const storage = this.storage[operator.key];
                        storage.set(JSON.parse(operator.old), true);
                        storage.save(true)
                    }
                }
            }
            this.switchHook && this.switchHook(true, this.index)
        }
    },
    redo() {
        if (this.index > -1) {
            const data = this.version[this.index--];
            for (let i = 0; i < data.length; i++) {
                const operator = data[i];
                if (this.storage.hasOwnProperty(operator.key)) {
                    if (operator.type === 'modify') {
                        const storage = this.storage[operator.key];
                        storage.set(JSON.parse(operator.new), true);
                        storage.save(true)
                    }
                }
            }
            this.switchHook && this.switchHook(false, this.index)
        }
    },
    clear(level) {
        if (level === 0) {
            // 清空对话
            for (let i = 0; i < chats.value.length; i++) {
                const chat = chats.value[i];
                if (chat.type === 'image') {
                    this.image.delete(chat.content);
                }
            }
            chats.value = [];
            message.notify('清空成功', message.success);
            this.save(['chats', 'images']);
        } else if (level === 1) {
            // 清空对话 + 角色
            chars.value = {};
            chats.value = [];
            images.value = {};
            message.notify('清空成功', message.success);
            this.save(['chars', 'chats', 'images']);
        } else if (level === 2) {
            // 清空本地数据
            localStorage.clear();
            indexedDB.deleteDatabase('data')
        }
    },
    char: {
        new(data) {
            data = copy(data);
            const id = uuid();
            chars.value[id] = data;
            avatars.value[id] = computed(() => {
                const avatar = chars.value[id].avatar;
                return images.value.hasOwnProperty(avatar) ? images.value[avatar].src : StaticUrl + avatar
            });
            return id
        },
        delete(id) {
            DataControl.image.delete(chars.value[id].avatar);
            delete chars.value[id];
            for (let i = chats.value.length - 1; i > -1; i--) {
                if (chats.value[i].char === id) {
                    chats.value.splice(i, 1);
                    DataControl.update('chats')
                }
            }
        }
    },
    image: null
};

for (let key in Data) {
    if (Data.hasOwnProperty(key)) {
        if (key === 'images') {
            const storage = new ImageStorage(key, Data[key]);
            DataControl.storage[key] = storage;
            DataControl.image = storage
        } else {
            DataControl.storage[key] = new Storage(key, Data[key])
        }
    }
}

document.addEventListener('keydown', event => {
    if (event.ctrlKey && ['TEXTAREA', 'INPUT'].indexOf(event.target.nodeName) === -1 || event.altKey) {
        if (event.code === 'KeyZ') {
            if (event.shiftKey) {
                DataControl.redo();
            } else {
                DataControl.withdraw();
            }
            event.preventDefault()
        } else if (event.code === 'KeyY') {
            DataControl.redo();
            event.preventDefault()
        }
    }
});

export {
    config,
    settings,
    chats,
    chars,
    images,
    avatars,
    Storage,
    ImageStorage,
    DataControl
}