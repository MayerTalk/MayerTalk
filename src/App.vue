<script setup lang="ts">
import '@/lib/data/versionControl'
import { config } from '@/lib/data/data'
import { currEditorRef } from '@/lib/data/state'

import Editors from '@/editor'
import About from '@/AboutDialog.vue'
import Announce from '@/AnnounceDialog.vue'
import FileDragger from '@/components/FileDragger.vue'
import SavefileDialog from '@/components/SavefileDialog.vue'
import SettingsDialog from '@/components/Settings/SettingsDialog.vue'
</script>

<template>
    <!--main components start-->
    <Announce/>
    <About/>
    <FileDragger/>
    <SettingsDialog/>
    <SavefileDialog/>
    <!--main components end-->
    <component :is="Editors[config.editor as keyof typeof Editors]" ref="currEditorRef"/>
</template>

<style src="@/style/font.css"></style>
<style>
body, html {
    margin: 0;
}
</style>
