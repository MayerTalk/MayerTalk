<script setup>
import { ref, onUnmounted } from 'vue'
import { t } from '@/lib/lang/translate'
import CharSelector from './CharSelector.vue'
import { closeShowHook } from '@/lib/data/showControl'

import { textarea } from '@/lib/function/dialogue'
import { chars } from '@/lib/data/data'
import { doAfterRefMounted } from '@/lib/utils/tool'

import { dialogWidth } from '@/lib/data/width'

const ifShow = ref(false)
const atWho = ref('')
const atWhoSelRef = ref(null)
let insertAt = 0

onUnmounted(closeShowHook.on(() => {
    if (ifShow.value) {
        ifShow.value = false
    }
}))

function handleAt (id) {
    // 被@角色刷入文本框
    textarea.value = textarea.value.slice(0, insertAt) +
      chars.value[id].name +
      ' ' +
      textarea.value.slice(insertAt)
    atWho.value = ''
    if (atWhoSelRef.value) {
        atWhoSelRef.value.blur()
    }
    ifShow.value = false
    setTimeout(() => {
        const el = document.getElementById('textarea')
        const range = insertAt + chars.value[id].name.length + 1
        el.focus()
        el.setSelectionRange(range, range)
    }, 100)
}

function open () {
    // @提示框显示后聚焦输入
    doAfterRefMounted(atWhoSelRef, (ref) => {
    // 等待动画结束
        setTimeout(() => {
            ref.value.focus()
        }, 150)
    })
}

function processInput (e) {
    // 处理键入@事件
    if (e.data === '@' && (e.inputType === 'insertText' || e.inputType === 'insertCompositionText')) {
        if (ifShow.value) {
            textarea.value = e.target.value.slice(0, e.target.selectionStart - 1) + e.target.value.slice(e.target.selectionStart)
            insertAt = e.target.selectionStart - 1
        } else {
            insertAt = e.target.selectionStart
            ifShow.value = true
            open()
        }
    }
}

defineExpose({
    processInput
})
</script>

<template>
  <el-dialog v-model="ifShow" :width="dialogWidth"
             :title="t.notify.wantToAtWhichCharacter"
             :modal="false">
    <CharSelector v-model="atWho"
                  v-model:select="atWhoSelRef"
                  style="width: 100%"
                  @change="handleAt" @visible-change="(visible) => {if (!visible) {ifShow=false}}"/>
  </el-dialog>
</template>
