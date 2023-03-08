<script setup>
import { ref, inject, onUnmounted } from 'vue'
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

function handleInput (value) {
    if (+value) {
        // 会有人copy小数来输入吗（
        lineno.value = Math.floor(+value)
    } else if (value === '') {
        lineno.value = null
    }
}

function handleNav () {
    if (lineno.value > chats.value.length || lineno.value < 1) {
        message.notify('该行数不存在', message.warning)
        return
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
<el-dialog v-model="ifShow" title="转到行" :width="dialogWidth" @closed="lineno=null">
    <el-input :modelValue="lineno" @update:modelValue="handleInput"
              :placeholder="'在此输入行数 (1~' + chats.length + ')' "
              @keypress.enter="handleNav"
              clearable ref="input"
    />
    <div class="column-display" style="margin-top: 10px; display: flex; justify-content: flex-end">
        <el-button style="width: 20%" @click="ifShow=false">取消</el-button>
        <el-button style="width: 20%" @click="handleNav" type="primary">确定</el-button>
    </div>
</el-dialog>
</template>
