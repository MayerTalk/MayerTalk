<script setup>
import '@/lib/data/versionControl'
import { ref, provide } from 'vue'
import Editors from './editor'
import Announce from './AnnounceDialog.vue'
import About from './AboutDialog.vue'
import FileDragger from '@/components/FileDragger.vue'
import { config } from '@/lib/data/data'

const ifShowAnnouncement = ref(false)
const ifShowSettings = ref(false)
const ifShowAbout = ref(false)

provide('ifShowAnnouncement', ifShowAnnouncement)
provide('ifShowSettings', ifShowSettings)
provide('ifShowAbout', ifShowAbout)
</script>

<template>
    <!--main components start-->
    <Announce v-model="ifShowAnnouncement"/>
    <About v-model="ifShowAbout"/>
    <FileDragger/>
    <!--main components end-->
    <component :is="Editors[config.editor]"/>
</template>

<style src="./font.css"></style>
<style>
body, html {
    margin: 0;
}
</style>
