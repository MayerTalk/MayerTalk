<script setup>
import { ref, computed, nextTick } from 'vue'
import { t } from '@/lib/lang/translate'
import message from '@/lib/utils/message'
import { uuid } from '@/lib/utils/tool'

const props = defineProps({
    modelValue: {
        type: Array
    },
    extraButton: {
        type: String,
        default: null
    }
})
const emit = defineEmits(['update:modelValue', 'done'])

const modelValue = computed({
    get () {
        return props.modelValue
    },
    set (value) {
        emit('update:modelValue', value)
    }
})

function deleteOption (index) {
    if (modelValue.value.length === 1) {
        message.notify(t.value.notify.cannotDeleteLastOption, message.warning)
    } else {
        modelValue.value.splice(index, 1)
    }
}

const inputRefs = ref([])

function focusFirst () {
    inputRefs.value[0].focus()
}

function focusLast () {
    inputRefs.value[inputRefs.value.length - 1].focus()
}

function handleEnder (event) {
    if (event.ctrlKey) {
        if (props.extraButton) {
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
              @keydown.enter="handleEnder"
              style="margin-bottom: 5px">
        <template #append>
            <el-icon @click="deleteOption(index)">
                <IconClose/>
            </el-icon>
        </template>
    </el-input>
    <div v-if="props.extraButton" style="display: flex;column-gap: 5px">
        <el-button @click="() => {modelValue.push([uuid(),''])}" style="width: 100%">{{ t.action.add }}</el-button>
        <el-button @click="$emit('done')" style="width: 100%; margin-left: 0">{{ props.extraButton }}</el-button>
    </div>
    <el-button v-else @click="() => {modelValue.push([uuid(),''])}" style="width: 100%">{{ t.action.add }}</el-button>
</template>

<style>
.el-input-group__append {
    padding: 0 10px;
}
</style>
