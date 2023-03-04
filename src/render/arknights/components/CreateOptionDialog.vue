<script setup>
import { ref } from 'vue'
import OptionDialog from '../type/OptionDialog.vue'

import { copy, uuid, ensureClose } from '@/lib/tool'
import { createDialogue } from '@/lib/dialogue'
import { dialogWidth } from '@/lib/constance'

const ifShow = ref(false)
const options = ref({})
function open () {
    options.value = [[uuid(), '']]
    ifShow.value = true
}

function createOptionDialogue () {
    ifShow.value = false
    createDialogue({
        content: copy(options.value),
        type: 'option'
    })
}

defineExpose({
    open
})
</script>

<template>
    <el-dialog v-model="ifShow" title="创建选项" :width="dialogWidth"
               :before-close="ensureClose"
               :show-close="false">
        <OptionDialog v-model="options" extraButton="创建" @done="createOptionDialogue"/>
    </el-dialog>
</template>
