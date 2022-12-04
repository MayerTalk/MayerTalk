<script setup>
    import {ref, provide, onMounted} from 'vue'
    import message from './lib/message';
    import {getData} from './lib/tool';
    import Renders from './render'
    import Announce from './Announce.vue'

    const ifShowAnnouncement = ref(false);
    const ifShowGuide = ref(false);
    const config = ref({render: 'Arknights'});
    const chars = ref({});
    const chats = ref([]);
    const images = ref({});

    let lastSave = '';
    let notifyMaxStorage = false;

    function save() {
        let data = {
            config: config.value,
            chars: chars.value,
            chats: chats.value,
            images: images.value
        };
        let dataStr = JSON.stringify(data);
        if (dataStr.length > 4 * 1024 * 1024) {
            // 5mb limit
            delete data.images;
            if (!notifyMaxStorage) {
                message.confirm('图片总体积超过4MB，将不会自动保存图片');
                notifyMaxStorage = true
            }
            dataStr = JSON.stringify(data);
        } else {
            if (notifyMaxStorage) {
                message.notify('图片总体积小于4MB，自动保存已恢复', message.success);
                notifyMaxStorage = false
            }
        }
        if (dataStr === lastSave) {
            return
        }
        lastSave = dataStr;
        localStorage.setItem('data', dataStr);
    }

    function setData(data, enableConfig) {
        if (data.hasOwnProperty('images')) {
            let tmp = data.images;
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
            images.value = data.images
        }
        if (data.hasOwnProperty('config') && enableConfig) {
            config.value = data.config
        }
        if (data.hasOwnProperty('chars')) {
            chars.value = data.chars
        }
        if (data.hasOwnProperty('chats')) {
            chats.value = data.chats
        }
    }

    provide('ifShowAnnouncement', ifShowAnnouncement);
    provide('ifShowGuide', ifShowGuide);
    provide('config', config);
    provide('chars', chars);
    provide('chats', chats);
    provide('images', images);
    provide('save', save);
    provide('setData', setData);

    onMounted(() => {
        setData(getData('data') || {}, true)
    })
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