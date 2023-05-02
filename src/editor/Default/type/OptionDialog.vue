<script setup>
import { computed } from 'vue'
import message from '@/lib/message'
import { uuid } from '@/lib/tool'

const props = defineProps(['modelValue', 'extraButton'])
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
        message.notify('你不能删除最后一个选项', message.warning)
    } else {
        modelValue.value.splice(index, 1)
    }
}

</script>

<template>
    <el-input id="" v-model="modelValue[index][1]" v-for="(value, index) in modelValue" :key="value[0]"
              style="margin-bottom: 5px">
        <template #append>
            <el-icon @click="deleteOption(index)">
                <IconClose/>
            </el-icon>
        </template>
    </el-input>
    <div v-if="props.extraButton" style="display: flex;column-gap: 5px">
        <el-button @click="() => {modelValue.push([uuid(),''])}" style="width: 100%">添加</el-button>
        <el-button @click="$emit('done')" style="width: 100%; margin-left: 0">{{props.extraButton}}</el-button>
    </div>
    <el-button v-else @click="() => {modelValue.push([uuid(),''])}" style="width: 100%">添加</el-button>
</template>

<style>
    .el-input-group__append {
        padding: 0 10px;
    }
</style>
