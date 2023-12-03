<script setup>
import { ref, computed } from 'vue'
import { t } from '@/lib/lang/translate'
import CharSelector from './CharSelector.vue'

import message from '@/lib/message'
import { copyDialogue } from '@/lib/dialogue'
import { currDialogueIndex } from '@/lib/data'
import { dialogWidth } from '@/lib/width'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue', 'coped'])

const ifShow = computed({
    get () {
        return props.modelValue
    },
    set (value) {
        emit('update:modelValue', value)
    }
})

const copyChars = ref([])

function handleCopy () {
    if (copyChars.value.length === 0) {
        message.notify(t.value.notify.pleaseSelectAtLeastOneCharacter, message.warning)
        return
    }
    const last = copyChars.value.length - 1
    for (let i = 0; i < copyChars.value.length; i++) {
        copyDialogue(currDialogueIndex.value, { char: copyChars.value[i] }, { locate: i === last, save: i === last })
    }
    copyChars.value = []
    ifShow.value = false
    emit('coped', true)
}
</script>

<template>
    <el-dialog v-model="ifShow" :title="t.notify.pleaseSelectTheCharToRepeat" :width="dialogWidth"
               @closed="copyChars = []">
        <el-button style="width: 100%;" @click="handleCopy">{{ t.action.repeat }}</el-button>
        <CharSelector v-model="copyChars" style="width: 100%; margin-top: 5px" :narration="true"
                      :multiple="true" :filterable="false"/>
    </el-dialog>
</template>
