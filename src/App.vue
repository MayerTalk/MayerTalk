<script setup>
import '@/lib/versionControl'
import { ref, provide } from 'vue'
import Renders from './render'
import Announce from './AnnounceDialog.vue'
import About from './AboutDialog.vue'
import { config } from '@/lib/data'

const ifShowAnnouncement = ref(false)
const ifShowSettings = ref(false)
const ifShowAbout = ref(false)

provide('ifShowAnnouncement', ifShowAnnouncement)
provide('ifShowSettings', ifShowSettings)
provide('ifShowAbout', ifShowAbout)
</script>

<template>
    <Announce v-model="ifShowAnnouncement"/>
    <About v-model="ifShowAbout"/>
    <component :is="Renders[config.render]"/>
</template>

<style src="./font.css"></style>
<style>
    body, html {
        margin: 0;
    }
</style>
