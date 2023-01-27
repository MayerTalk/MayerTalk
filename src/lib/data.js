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
            if (data) {
                this.obj.value = data;
                this.lastSave = dataStr;
                return true
            }
        } catch (e) {
        }
        return false
    }

    set(data) {
        this.obj.value = data
    }
};

const ImageStorage = class ImageStorage {
    constructor(key, obj) {
        this.key = key;
        this.obj = obj;
        this.lastSave = JSON.stringify(obj.value);
        this.update = false;
        this.notifyMaxStorage = false
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
            if (dataStr.length > 4 * 1024 * 1024) {
                // 5mb limit
                if (!this.notifyMaxStorage) {
                    message.confirm('图片总体积超过4MB，将不会自动保存图片');
                    this.notifyMaxStorage = true
                }
            } else {
                if (this.notifyMaxStorage) {
                    message.notify('图片总体积小于4MB，自动保存已恢复', message.success);
                    this.notifyMaxStorage = false
                }
                localStorage.setItem('data.' + this.key, dataStr);
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
            const dataStr = localStorage.getItem('data.' + this.key);
            const data = JSON.parse(dataStr);
            if (data) {
                this.obj.value = data;
                this.lastSave = dataStr;
                return true
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
                        if (tmp[imageId].src.indexOf('data:image') !== 0) {
                            // 非avatar/(内置)和data:image(b64)视为不安全数据
                            message.confirm('导入的文件有不安全图片，请核实来源（图片ID：' + imageId + '）', '警告');
                            delete tmp[imageId];
                            throw TypeError
                        }
                    } else if (
                        tmp[imageId].indexOf('data:image') !== 0) {
                        // 老数据适配
                        // 非avatar/(内置)和data:image(b64)视为不安全数据
                        message.confirm('导入的文件有不安全图片，请核实来源（图片ID：' + imageId + '）', '警告');
                        delete tmp[imageId];
                        throw TypeError
                    }
                }
            }
        }
        this.obj.value = tmp
    }
};

const DataControl = {
    storage: {},
    version: [],
    index: -1,
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
    load() {
        for (let key in this.storage) {
            if (this.storage.hasOwnProperty(key)) {
                this.storage[key].load();
                this.storage[key].update = false
            }
        }
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
        }
    },
    clear(level) {
        if (level === 0) {
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
            chars.value = {};
            chats.value = [];
            images.value = {};
            message.notify('清空成功', message.success);
            this.save(['chars', 'chats', 'images']);
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
            })
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
    image: {
        new(blob, callback) {
            blob2base64(blob, (b64) => {
                if (b64) {
                    const id = md5(b64);
                    if (images.value.hasOwnProperty(id)) {
                        images.value[id].count++;
                    } else {
                        images.value[id] = {count: 1, src: b64};
                    }
                    DataControl.update('images');
                    callback && callback(id);
                } else {
                    callback && callback(null)
                }
            });
        },
        delete(id) {
            if (images.value.hasOwnProperty(id)) {
                images.value[id].count--;
                if (images.value[id].count < 1) {
                    delete images.value[id]
                }
                DataControl.update('images')
            }
        },
        count(id) {
            if (images.value.hasOwnProperty(id)) {
                images.value[id].count++
            }
        }
    },
};

for (let key in Data) {
    if (Data.hasOwnProperty(key)) {
        if (key === 'images') {
            DataControl.storage[key] = new ImageStorage(key, Data[key])
        } else {
            DataControl.storage[key] = new Storage(key, Data[key])
        }
    }
}

document.addEventListener('keydown', event => {
    if (event.ctrlKey && ['TEXTAREA', 'INPUT'].indexOf(event.target.nodeName) === -1) {
        if (event.code === 'KeyZ') {
            DataControl.withdraw();
            event.preventDefault()
        } else if (event.code === 'KeyY') {
            DataControl.redo();
            event.preventDefault()
        }
    }
});

DataControl.load();

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