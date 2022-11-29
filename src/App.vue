<script setup>
    import {ref, provide, onMounted} from 'vue'
    import message from './lib/message';
    import {getData} from './lib/tool';
    import Renders from './render'
    import Announce from './Announce.vue'
    import Test from './Test.vue'

    const showAnnouncement = ref(false);
    const config = ref({
        render: 'Arknights',
        style: 'default',
        settings: {}
    });
    const chars = ref({});
    const chats = ref([]);
    const images = ref({});

    let lastSave = '';
    let notifyMaxStorage = false;

    function save() {
        let data = {
            chars: chars.value,
            chats: chats.value,
            images: images.value,
            config: config.value
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

    provide('showAnnouncement', showAnnouncement);
    provide('config', config);
    provide('chars', chars);
    provide('chats', chats);
    provide('images', images);
    provide('save', save);

    onMounted(() => {
        const data = getData('data') || {};
        if (data.hasOwnProperty('config')) {
            config.value = data.config
        }
        if (data.hasOwnProperty('chars')) {
            chars.value = data.chars
        }
        if (data.hasOwnProperty('chats')) {
            chats.value = data.chats
        }
        if (data.hasOwnProperty('images')) {
            images.value = data.images
        }
    })
</script>

<template>
<!--    <Test/>-->
    <Announce v-model="showAnnouncement"/>
    <component :is="Renders[config.render]"/>
</template>

<style src="./font.css"></style>
<style>
    body, html {
        margin: 0;
    }
</style>