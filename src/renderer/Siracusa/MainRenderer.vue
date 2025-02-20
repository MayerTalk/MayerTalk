<script setup>
import { inject } from 'vue'
import Dialogue from './components/DialogueItem.vue'
import SettingsDialog from './components/SettingsDialog.vue'

import plus1 from '@/lib/function/plus1'
import { chats } from '@/lib/data/data'
import { rendererSettings } from '@/renderer/Siracusa';
import { cutPoints, currCutPoint, cutPointViewMode } from '@/components/ManualCutPoint/manualCoutPointControl'
import { partialChats } from '@/components/PartialScreenshot/partialScreenshotControl'

defineEmits(['edit', 'delete', 'plus1'])

const rendererWidth = inject('rendererWidth')

defineExpose({
    SettingsDialog,
    rendererSettings
})
</script>

<template>
    <div class="renderer" id="renderer"
         :style="{width: rendererWidth.window+'px', background: rendererSettings.background}">
        <Dialogue v-for="(dialogue, index) in chats"
                  :data="chats[index]"
                  :key="dialogue.id"
                  @edit="args => $emit('edit',args)"
                  @delete="args => $emit('delete',args)"
                  @plus1="args => $emit('plus1',args)"
                  :index="index"
                  :plus1="plus1 === index"
                  :cut-point="Object.prototype.hasOwnProperty.call(cutPoints,chats[index].id) && cutPointViewMode"
                  :select="Object.prototype.hasOwnProperty.call(partialChats,chats[index].id)"
                  :cut-point-active="currCutPoint===chats[index].id"
                  style="position:relative"></Dialogue>
    </div>
</template>

<style src="./style/renderer.css" scoped/>
