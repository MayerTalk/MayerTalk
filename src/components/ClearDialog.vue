<script setup>
import { ref, computed } from 'vue'
import { t } from '@/lib/lang/translate'
import message from '@/lib/utils/message'
import { dialogWidth } from '@/lib/data/width'
import { DataControl } from '@/lib/data/data'
import { copy } from '@/lib/utils/tool'

const props = defineProps({
    modelValue: null
})
const emit = defineEmits([
    'update:modelValue'
])

const ifShow = computed({
    get () {
        return props.modelValue
    },
    set (value) {
        emit('update:modelValue', value)
    }
})

const clearList = ref([])

function handleChange (newValue) {
    if (newValue.indexOf('chars') !== -1 && clearList.value.indexOf('chats') === -1) {
        newValue.push('chats')
    } else if (newValue.indexOf('chats') === -1 && clearList.value.indexOf('chars') !== -1) {
        newValue.pop('chars')
    }
    clearList.value = newValue
}

function clear () {
    const data = copy(clearList.value)
    ifShow.value = false
    const typeGroup = []
    for (let i = 0; i < data.length; i++) {
        if (['chats', 'chars'].indexOf(data[i]) === -1) {
            typeGroup.push(t.value.noun[data[i]])
        } else {
            typeGroup.push(t.value.noun[data[i].slice(0, -1)])
        }
    }
    message.confirm(t.value.notify.aboutToClear + ' ' + typeGroup.join(', '), t.value.noun.hint, () => {
        DataControl.clear(data)
    }, () => {
        clearList.value = data
        ifShow.value = true
    })
}
</script>

<template>
    <el-dialog v-model="ifShow" :title="t.notify.pleaseSelectTheTypeToClear" :width="dialogWidth"
               @closed="clearList=[]">
        <el-checkbox-group :model-value="clearList" @update:model-value="handleChange" style="padding: 0 20px">
            <el-checkbox label="chats" style="width: 50%;margin: 0"> {{ t.noun.chat }}</el-checkbox>
            <el-checkbox label="settings" style="width: 50%;margin: 0"> {{ t.noun.settings }}</el-checkbox>
            <el-checkbox label="chars" style="width: 50%;margin: 0"> {{ t.noun.char }}</el-checkbox>
            <el-checkbox label="savefile" style="width: 50%;margin: 0"> {{ t.noun.savefile }}</el-checkbox>
        </el-checkbox-group>
        <div class="column-display" style="margin-top: 10px; display: flex; justify-content: flex-end">
            <el-button style="width: 20%" @click="ifShow=false">{{ t.action.cancel }}</el-button>
            <el-button style="width: 20%" @click="clear" type="primary">{{ t.action.confirm }}</el-button>
        </div>
    </el-dialog>
</template>

<style scoped>

</style>
