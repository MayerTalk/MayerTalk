<script setup>
    import {ref, provide, onMounted} from 'vue'
    import message from './lib/message';
    import {copy} from './lib/tool';
    import './lib/clear';
    import Renders from './render'
    import Announce from './Announce.vue'

    const ifShowAnnouncement = ref(false);
    const ifShowGuide = ref(false);
    const config = ref({render: 'Arknights'});
    const settings = ref({});
    const chars = ref({});
    const chats = ref([]);
    const images = ref({});

    const Data = {
        config,
        settings,
        chars,
        chats,
        images
    };

    let notifyMaxStorage = false;

    const Storage = class Storage {
        constructor(key, obj) {
            this.key = key;
            this.obj = obj;
            this.lastSave = '';
            this.update = false;
            // TODO doesn't work
            // watch(this.obj, () => {
            //     this.update = true
            // })
        }

        save() {
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
            this.lastSave = '';
            this.update = false;
            // TODO doesn't work
            // watch(this.obj, () => {
            //     this.update = true
            // })
        }

        save() {
            if (this.update) {
                this.update = false;
                const lastSave = this.lastSave;
                const dataStr = JSON.stringify(this.obj.value);
                if (dataStr === lastSave) {
                    return false
                }
                if (dataStr.length > 4 * 1024 * 1024) {
                    // 5mb limit
                    if (!notifyMaxStorage) {
                        message.confirm('图片总体积超过4MB，将不会自动保存图片');
                        notifyMaxStorage = true
                    }
                } else {
                    if (notifyMaxStorage) {
                        message.notify('图片总体积小于4MB，自动保存已恢复', message.success);
                        notifyMaxStorage = false
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

        set(data) {
            const tmp = copy(data);
            for (let imageId in tmp) {
                if (tmp.hasOwnProperty(imageId)) {
                    if (tmp[imageId].indexOf('/avatar/') !== 0 && tmp[imageId].indexOf('data:image') !== 0) {
                        // 非/avatar/(内置)和data:image(b64)视为不安全数据
                        message.confirm('导入的文件有不安全图片，请核实来源（图片ID：' + imageId + '）', '警告');
                        delete tmp[imageId];
                        throw TypeError
                    }
                }
            }
            this.obj.value = tmp
        }
    };

    const DataControl = {
        storage: {},
        version: [],
        index: 0,
        update(update) {
            if (typeof update === "string") {
                if (this.storage.hasOwnProperty(update)) {
                    this.storage[update].update = true
                }
            } else {

                for (let i = 0; i < update.length; i++) {
                    if (this.storage.hasOwnProperty(update[i])) {
                        this.storage[update[i]].update = true
                    }
                }
            }
        },
        save(update = []) {
            this.update(update);
            const operator = [];
            for (let key in this.storage) {
                if (this.storage.hasOwnProperty(key)) {
                    const r = this.storage[key].save();
                    if (r) {
                        operator.push(r)
                    }
                }
            }

            if (operator) {
                this.version.unshift(operator);
                console.log(this.version)
            }

        },
        load() {
            for (let key in this.storage) {
                if (this.storage.hasOwnProperty(key)) {
                    this.storage[key].load();
                    this.storage[key].update = false
                }

            }
        },
        set(data) {
            for (let key in this.storage) {
                if (this.storage.hasOwnProperty(key) && data.hasOwnProperty(key)) {
                    this.storage[key].set(data[key]);
                    this.storage[key].update = true
                }
            }
        }
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

    provide('ifShowAnnouncement', ifShowAnnouncement);
    provide('ifShowGuide', ifShowGuide);
    provide('config', config);
    provide('settings', settings);
    provide('chars', chars);
    provide('chats', chats);
    provide('images', images);
    provide('DataControl', DataControl);

    DataControl.load();
</script>

<template>
    <Announce @showGuide="() => {ifShowAnnouncement=false; ifShowGuide=true}" v-model="ifShowAnnouncement"/>
    <component :is="Renders[config.render]"/>
</template>

<style src="./font.css"></style>
<style>
    body, html {
        margin: 0;
    }
</style>