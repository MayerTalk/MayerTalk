<script setup lang="ts">
import { ref, useTemplateRef, inject, onMounted, onUnmounted } from 'vue'
import { t } from '@/lib/lang/translate'
import { chats } from '@/lib/data/data'
import { getDialogue, doAfterRefMounted, ensureValue, assertNonValue } from '@/lib/utils/tool'
import message from '@/lib/utils/message'
import { dialogWidth } from '@/lib/data/width'
import { closeShowHook } from '@/lib/data/showControl'
import type { Ref } from 'vue'
import type { ElInput, ElScrollbar } from 'element-plus'

const ifShow = ref(false)
const lineno = ref(-1)
const inputRef = useTemplateRef<InstanceType<typeof ElInput>>('inputRef')
const scrollRef = inject<Ref<InstanceType<typeof ElScrollbar>>>('scroll')

onUnmounted(closeShowHook.on(() => {
    if (ifShow.value) {
        ifShow.value = false
    }
}))

function open() {
    ifShow.value = true
    setTimeout(() => {
        doAfterRefMounted(inputRef, (r) => {
            r.value.focus()
        })
    })
}

onMounted(() => {
    const controller = new AbortController()
    document.addEventListener('keydown', event => {
        if (event.ctrlKey) {
            if (event.code === 'KeyG') {
                open()
                event.preventDefault()
            }
        }
    }, { signal: controller.signal })
    onUnmounted(() => {
        controller.abort()
    })
})

function handleNav() {
    if (!+lineno.value && +lineno.value !== 0) {
        message.notify(t.value.notify.pleaseEnterValidNumber, message.warning)
        return
    }
    if (lineno.value > chats.value.length) {
        // 超出最大上限，选择最后对话
        lineno.value = chats.value.length
    } else if (lineno.value < 1) {
        // 不存在的index，虽然一般不会如此输入（
        lineno.value = 1
    }
    const chat = getDialogue(chats.value[lineno.value - 1].id)
    assertNonValue(scrollRef, 'scrollRef')
    if (ensureValue(document.getElementById('renderer'), 'renderer').offsetHeight - chat.offsetTop < window.innerHeight) {
        scrollRef.value.setScrollTop(chat.offsetTop)
    } else {
        scrollRef.value.setScrollTop(chat.offsetTop - window.innerHeight / 3)
    }
    ifShow.value = false
}

defineExpose({
    open
})
</script>

<template>
    <el-dialog v-model="ifShow" :title="t.action.goto" :width="dialogWidth" @closed="lineno = -1">
        <el-input v-model="lineno" :placeholder="t.notify.enterNumberOfLinesHere + ' (1~' + chats.length + ')'"
            @keypress.enter="handleNav" clearable ref="inputRef" />
        <div class="column-display" style="margin-top: 10px; display: flex; justify-content: flex-end">
            <el-button style="width: 20%" @click="ifShow = false">{{ t.action.cancel }}</el-button>
            <el-button style="width: 20%" @click="handleNav" type="primary">{{ t.action.confirm }}</el-button>
        </div>
    </el-dialog>
</template>
