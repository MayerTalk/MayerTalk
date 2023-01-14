<script setup>
    import {ref, provide} from 'vue'
    import Renders from './render'
    import Announce from './Announce.vue'
    import {config} from './data'

    const ifShowAnnouncement = ref(false);
    const ifShowSettings = ref(false);
    const ifShowGuide = ref(false);

    provide('staticUrl', 'https://static.mayertalk.top/');
    provide('ifShowAnnouncement', ifShowAnnouncement);
    provide('ifShowSettings', ifShowSettings);
    provide('ifShowGuide', ifShowGuide);
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