<script setup>
import { ref } from 'vue'
import { t } from '@/lib/lang/translate'
import CharSelector from './CharSelector.vue'

import { textarea } from '@/lib/dialogue'
import { chars } from '@/lib/data'
import { doAfterMounted } from '@/lib/tool'
import { dialogWidth } from '@/lib/constance'

const ifShow = ref(false)
const atWho = ref('')
const atWhoSelRef = ref(null)
let insertAt = 0

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
        const el = document.querySelector('#textarea')
        const range = insertAt + chars.value[id].name.length + 1
        el.focus()
        el.setSelectionRange(range, range)
    }, 100)
}

function open () {
    // @提示框显示后聚焦输入
    doAfterMounted(atWhoSelRef, (ref) => {
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
