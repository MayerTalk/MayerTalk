<script setup>
import { ref } from 'vue'
import { t } from '@/lib/lang/translate'
import CharSelector from './CharSelector.vue'

import message from '@/lib/utils/message'
import { copyDialogue } from '@/lib/function/dialogue'
import { currDialogueIndex } from '@/lib/data/data'
import { dialogWidth } from '@/lib/data/width'
import { defaultShow } from '@/editor/Default/lib/showControl'

const emit = defineEmits(['coped'])

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
    defaultShow.copy.value = false
    emit('coped', true)
}
</script>

<template>
    <el-dialog v-model="defaultShow.copy.value" :title="t.notify.pleaseSelectTheCharToRepeat" :width="dialogWidth"
               @closed="copyChars = []">
        <el-button style="width: 100%;" @click="handleCopy">{{ t.action.repeat }}</el-button>
        <CharSelector v-model="copyChars" style="width: 100%; margin-top: 5px" :narration="true"
                      :multiple="true" :filterable="false"/>
    </el-dialog>
</template>
