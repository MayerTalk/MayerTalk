<script setup>
import { ref } from 'vue'
import { t } from '@/lib/lang/translate'
import OptionDialog from '../type/OptionDialog.vue'

import { copy, uuid, ensureClose, doAfterMounted } from '@/lib/tool'
import { createDialogue } from '@/lib/dialogue'
import { dialogWidth } from '@/lib/constance'

const ifShow = ref(false)
const options = ref({})
function open () {
    options.value = [[uuid(), '']]
    ifShow.value = true
    doAfterMounted(dialogRef, (r) => {
        r.value.focusFirst()
    })
}
const dialogRef = ref(null)

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
    <el-dialog v-model="ifShow" :title="t.action.createOption" :width="dialogWidth"
               :before-close="ensureClose"
               :show-close="false">
        <OptionDialog v-model="options" :extraButton="t.action.create" @done="createOptionDialogue" ref="dialogRef"/>
    </el-dialog>
</template>
