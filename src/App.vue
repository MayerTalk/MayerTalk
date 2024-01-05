<script setup>
import '@/lib/data/versionControl'
import Editors from './editor'
import Announce from './AnnounceDialog.vue'
import About from './AboutDialog.vue'
import FileDragger from '@/components/FileDragger.vue'
import SettingsDialog from '@/components/SettingsDialog.vue'
import SavefileDialog from '@/components/SavefileDialog.vue'
import { config } from '@/lib/data/data'
import { currEditorRef } from '@/lib/data/stats'
</script>

<template>
    <!--main components start-->
    <Announce/>
    <About/>
    <FileDragger/>
    <SettingsDialog/>
    <SavefileDialog/>
    <!--main components end-->
    <component :is="Editors[config.editor]" ref="currEditorRef"/>
</template>

<style src="./font.css"></style>
<style>
body, html {
    margin: 0;
}
</style>
