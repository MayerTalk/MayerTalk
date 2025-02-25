<script setup lang="ts">
import { useTemplateRef, nextTick } from 'vue'
import { t } from '@/lib/lang/translate'
import message from '@/lib/utils/message'
import { uuid, hasOwn, ensureValue, assertNonValue } from '@/lib/utils/tool'
import { ElInput } from 'element-plus';


const modelValue = defineModel<Array<[string, string]>>({ required: true })

const { extraButton = '' } = defineProps<{
    extraButton: string
}>()

const emit = defineEmits<{
    done: []
}>()

const inputRefs = useTemplateRef<Array<InstanceType<typeof ElInput>>>('inputRefs')

function deleteOption(index: number) {
    if (modelValue.value.length === 1) {
        message.notify(t.value.notify.cannotDeleteLastOption, message.warning)
    } else {
        modelValue.value.splice(index, 1)
    }
}


function focusFirst() {
    ensureValue(inputRefs.value, 'inputRefs')[0].focus()
}

function focusLast() {
    assertNonValue(inputRefs.value, 'inputRefs')
    inputRefs.value[inputRefs.value.length - 1].focus()
}

function handleEnder(event: Event | KeyboardEvent) {
    if (hasOwn(event, 'ctrl') && event.ctrl) {
        if (extraButton) {
            emit('done')
        }
        return
    }
    modelValue.value.push([uuid(), ''])
    nextTick(() => {
        focusLast()
    })
}

defineExpose({
    focusFirst
})
</script>

<template>
    <el-input id="" v-model="modelValue[index][1]" v-for="(value, index) in modelValue" :key="value[0]" ref="inputRefs"
        @keydown.enter="handleEnder" style="margin-bottom: 5px">
        <template #append>
            <el-icon @click="deleteOption(index)">
                <IconClose />
            </el-icon>
        </template>
    </el-input>
    <div v-if="extraButton" style="display: flex;column-gap: 5px">
        <el-button @click="() => { modelValue.push([uuid(), '']) }" style="width: 100%">{{ t.action.add }}</el-button>
        <el-button @click="$emit('done')" style="width: 100%; margin-left: 0">{{ extraButton }}</el-button>
    </div>
    <el-button v-else @click="() => { modelValue.push([uuid(), '']) }" style="width: 100%">{{ t.action.add
    }}</el-button>
</template>

<style>
/*noinspection CssUnusedSymbol*/
.el-input-group__append {
    padding: 0 10px;
}
</style>
