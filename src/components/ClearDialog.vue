<script setup lang="ts">
import { ref } from 'vue'
import { t } from '@/lib/lang/translate'
import message from '@/lib/utils/message'
import { dialogWidth } from '@/lib/data/width'
import { DataControl } from '@/lib/data/data'
import { copy } from '@/lib/utils/tool'
import type { Ref } from 'vue';

const ifShow = defineModel<boolean>()

const clearList: Ref<Array<string>> = ref([])

function handleChange(newValue: Array<string>) {
    if (newValue.indexOf('chars') !== -1 && clearList.value.indexOf('chats') === -1) {
        // 选中chars时，强制同步选择chats
        newValue.push('chats')
    } else if (newValue.indexOf('chats') === -1 && clearList.value.indexOf('chars') !== -1) {
        // 取消选中chats时，强制同步取消选择chars
        newValue.splice(newValue.indexOf('chars'), 1)
    }
    clearList.value = newValue
}

function clear() {
    const data = copy(clearList.value)
    ifShow.value = false
    const typeGroup:Array<string> = []
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
            <el-checkbox value="chats" style="width: 50%;margin: 0"> {{ t.noun.chat }}</el-checkbox>
            <el-checkbox value="settings" style="width: 50%;margin: 0"> {{ t.noun.settings }}</el-checkbox>
            <el-checkbox value="chars" style="width: 50%;margin: 0"> {{ t.noun.char }}</el-checkbox>
            <el-checkbox value="savefile" style="width: 50%;margin: 0"> {{ t.noun.savefile }}</el-checkbox>
            <el-checkbox value="cutPoint" style="width: 50%;margin: 0">{{ t.noun.cutPoint }}</el-checkbox>
        </el-checkbox-group>
        <div class="column-display" style="margin-top: 10px; display: flex; justify-content: flex-end">
            <el-button style="width: 20%" @click="ifShow=false">{{ t.action.cancel }}</el-button>
            <el-button style="width: 20%" @click="clear" type="primary">{{ t.action.confirm }}</el-button>
        </div>
    </el-dialog>
</template>

<style scoped>

</style>
