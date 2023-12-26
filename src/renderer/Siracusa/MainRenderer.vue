<script setup>
import { inject } from 'vue'
import Dialogue from './components/DialogueItem.vue'

import plus1 from '@/lib/function/plus1'
import { chats } from '@/lib/data/data'
import { syncedSettings } from '@/lib/data/settings'
import { cutPoints, currCutPoint, cutPointViewMode } from '@/components/ManualCutPoint/control'

const rendererWidth = inject('rendererWidth')

defineEmits(['edit', 'delete', 'plus1'])
</script>

<template>
    <div class="renderer" id="renderer"
         :style="{width: rendererWidth.window+'px', background: syncedSettings.background}"
    >
        <Dialogue v-for="(dialogue, index) in chats"
                  :data="chats[index]"
                  :key="dialogue.id"
                  @edit="args => $emit('edit',args)"
                  @delete="args => $emit('delete',args)"
                  @plus1="args => $emit('plus1',args)"
                  :index="index"
                  :plus1="plus1 === index"
                  :cut-point="Object.prototype.hasOwnProperty.call(cutPoints,chats[index].id) && cutPointViewMode"
                  :cut-point-active="currCutPoint===chats[index].id"
                  style="position:relative"></Dialogue>
    </div>
</template>

<style src="./style/renderer.css" scoped/>
