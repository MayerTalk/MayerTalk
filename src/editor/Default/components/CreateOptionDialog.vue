<script setup lang="ts">
import { onUnmounted, ref, useTemplateRef } from 'vue'

import { t } from '@/lib/lang/translate'
import { createDialogue } from '@/lib/function/dialogue'
import { copy, uuid, ensureClose, doAfterRefMounted } from '@/lib/utils/tool'

import { dialogWidth } from '@/lib/data/width'
import { closeShowHook } from '@/lib/data/showControl'
import type { ChatType } from '@/lib/data/dataTypes.d';

import OptionDialog from '@/editor/Default/type/OptionDialog.vue'

const ifShow = ref(false)
const options = ref<ChatType['option']>([])
const dialogRef = useTemplateRef<InstanceType<typeof OptionDialog>>('dialogRef')

onUnmounted(closeShowHook.on(() => {
    if (ifShow.value) {
        ifShow.value = false
    }
}))

function open() {
    options.value = [[uuid(), '']]
    ifShow.value = true
    doAfterRefMounted(dialogRef, (r) => {
        r.value.focusFirst()
    })
}


function createOptionDialogue() {
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
    <el-dialog v-model="ifShow" :title="t.action.createOption" :width="dialogWidth" :before-close="ensureClose"
        :show-close="false">
        <OptionDialog v-model="options" :extraButton="t.action.create" @done="createOptionDialogue" ref="dialogRef" />
    </el-dialog>
</template>
