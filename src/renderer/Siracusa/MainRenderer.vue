<script setup lang="ts">
import { inject, type Ref } from 'vue'

import plus1 from '@/lib/function/plus1'

import { chats } from '@/lib/data/data'

import { rendererSettings } from '@/renderer/Siracusa';
import { partialChats } from '@/components/PartialScreenshot/partialScreenshotControl'
import { cutPoints, currCutPoint, cutPointViewMode } from '@/components/ManualCutPoint/manualCoutPointControl'

import Dialogue from './components/DialogueItem.vue'
import SettingsDialog from './components/SettingsDialog.vue'

defineEmits<{
    edit: [index: number],
    delete: [index: number],
    plus1: [index: number]
}>()

const rendererWidth = inject<Ref<{
    window: number
}>>('rendererWidth') as Ref<{
    window: number
}>

defineExpose({
    SettingsDialog,
    rendererSettings
})
</script>

<template>
    <div class="renderer" id="renderer"
        :style="{ width: rendererWidth.window + 'px', background: rendererSettings.background }">
        <Dialogue v-for="(dialogue, index) in chats" :data="chats[index]" :key="dialogue.id"
            @edit="args => $emit('edit', args)" @delete="args => $emit('delete', args)"
            @plus1="args => $emit('plus1', args)" :index="index" :plus1="plus1 === index"
            :cut-point="Object.prototype.hasOwnProperty.call(cutPoints, chats[index].id) && cutPointViewMode"
            :select="Object.prototype.hasOwnProperty.call(partialChats, chats[index].id)"
            :cut-point-active="currCutPoint === chats[index].id" style="position:relative"></Dialogue>
    </div>
</template>

<style src="./style/renderer.css" scoped />
