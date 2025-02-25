<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { t } from '@/lib/lang/translate'
import CharSelector from './CharSelector.vue'
import { closeShowHook } from '@/lib/data/showControl'

import { textarea } from '@/lib/function/dialogue'
import { chars } from '@/lib/data/data'
import { doAfterRefMounted, ensureValue } from '@/lib/utils/tool'

import { dialogWidth } from '@/lib/data/width'
import type { ElSelect } from 'element-plus';

const ifShow = ref(false)
const atWho = ref('')
const atWhoSelRef = ref<InstanceType<typeof ElSelect> | null>(null)
let insertAt = 0
onUnmounted(closeShowHook.on(() => {
    if (ifShow.value) {
        ifShow.value = false
    }
}))

function handleAt(id: string) {
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
        const el = ensureValue(document.getElementById('textarea'), 'textarea') as HTMLTextAreaElement
        const range = insertAt + chars.value[id].name.length + 1
        el.focus()
        el.setSelectionRange(range, range)
    }, 100)
}

function open() {
    // @提示框显示后聚焦输入
    doAfterRefMounted(atWhoSelRef, (ref) => {
        // 等待动画结束
        setTimeout(() => {
            ref.value.focus()
        }, 150)
    })
}

function processInput(e: InputEvent) {
    // 处理键入@事件
    if (e.target && e.data === '@' && (e.inputType === 'insertText' || e.inputType === 'insertCompositionText')) {
        const target = e.target as HTMLTextAreaElement
        if (ifShow.value) {
            textarea.value = target.value.slice(0, target.selectionStart - 1) + target.value.slice(target.selectionStart)
            insertAt = target.selectionStart - 1
        } else {
            insertAt = target.selectionStart
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
    <el-dialog v-model="ifShow" :width="dialogWidth" :title="t.notify.wantToAtWhichCharacter" :modal="false">
        <CharSelector v-model="atWho" v-model:select="atWhoSelRef" style="width: 100%" @change="handleAt"
            @visible-change="(visible: boolean) => { if (!visible) { ifShow = false } }" />
    </el-dialog>
</template>
