<script setup>
    import {ref, provide} from 'vue'
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

    provide('showAnnouncement', showAnnouncement);
    provide('config', config);
    provide('chars', chars);
    provide('chats', chats);
    provide('images', images)
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