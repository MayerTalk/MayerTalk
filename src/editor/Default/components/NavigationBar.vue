<script setup>
import { ref, inject, onUnmounted } from 'vue'
import { t } from '@/lib/lang/translate'
import { chats } from '@/lib/data'
import { getDialogue, doAfterMounted } from '@/lib/tool'
import { dialogWidth } from '@/lib/constance'
import message from '@/lib/message'

const ifShow = ref(false)
const lineno = ref(null)
const input = ref(null)
const scroll = inject('scroll')

function open () {
    ifShow.value = true
    doAfterMounted(input, (r) => {
        r.value.focus()
    })
}

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

function handleNav () {
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
    if (document.getElementById('window').offsetHeight - chat.offsetTop < window.innerHeight) {
        scroll.value.setScrollTop(chat.offsetTop)
    } else {
        scroll.value.setScrollTop(chat.offsetTop - window.innerHeight / 3)
    }
    ifShow.value = false
}

defineExpose({
    open
})
</script>

<template>
    <el-dialog v-model="ifShow" :title="t.action.goto" :width="dialogWidth" @closed="lineno=null">
        <el-input v-model="lineno"
                  :placeholder="t.notify.enterNumberOfLinesHere + ' (1~' + chats.length + ')' "
                  @keypress.enter="handleNav"
                  clearable ref="input"
        />
        <div class="column-display" style="margin-top: 10px; display: flex; justify-content: flex-end">
            <el-button style="width: 20%" @click="ifShow=false">{{ t.action.cancel }}</el-button>
            <el-button style="width: 20%" @click="handleNav" type="primary">{{ t.action.confirm }}</el-button>
        </div>
    </el-dialog>
</template>
