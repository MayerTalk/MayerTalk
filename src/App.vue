<script setup>
    import '@/lib/versionControl'
    import {ref, provide} from 'vue'
    import Renders from './render'
    import Announce from './Announce.git.vue'
    import About from './About.vue'
    import {config} from './data'

    const ifShowAnnouncement = ref(false);
    const ifShowSettings = ref(false);
    const ifShowGuide = ref(false);
    const ifShowAbout = ref(false);

    provide('ifShowAnnouncement', ifShowAnnouncement);
    provide('ifShowSettings', ifShowSettings);
    provide('ifShowGuide', ifShowGuide);
    provide('ifShowAbout', ifShowAbout);
</script>

<template>
    <Announce @showGuide="() => {ifShowAnnouncement=false; ifShowGuide=true}" v-model="ifShowAnnouncement"/>
    <About v-model="ifShowAbout"/>
    <component :is="Renders[config.render]"/>
</template>

<style src="./font.css"></style>
<style>
    body, html {
        margin: 0;
    }
</style>