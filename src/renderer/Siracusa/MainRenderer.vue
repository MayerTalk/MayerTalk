<script setup>
import { inject } from 'vue'
import Dialogue from './components/DialogueItem.vue'

import plus1 from '@/lib/plus1'
import { chats } from '@/lib/data'

const width = inject('width')
const rendererSettings = inject('rendererSettings')

defineEmits(['edit', 'delete', 'plus1'])
</script>

<template>
    <div class="window" id="window"
         :style="{width: width.window+'px', background: rendererSettings.background}"
    >
        <Dialogue v-for="(dialogue, index) in chats"
                  @edit="args => $emit('edit',args)"
                  @delete="args => $emit('delete',args)"
                  @plus1="args => $emit('plus1',args)"
                  :data="chats[index]" :index="index" :key="dialogue.id" :plus1="plus1 === index"
                  style="position:relative"></Dialogue>
    </div>

</template>

<style src="./style/renderer.css" scoped/>
