<script setup lang="ts">
import { computed, ref } from 'vue'


const model = defineModel<number>()
const { defaultValue, placeholder, validatePositive = true } = defineProps<{
    defaultValue: number,
    placeholder?: string,
    validatePositive?: boolean,
}>()
const cache = ref('')


const showModel = computed({
    get() {
        return cache.value ? cache.value : model.value === defaultValue ? undefined: model.value
    },
    set(param: string) {
        cache.value = param
    }
})

function sync(param: string) {
    model.value = parse(param)
    cache.value = ''
}

function parse(param: string) {
    const num = parseFloat(param)
    if (!isNaN(num)) {
        if (validatePositive && num < 0) {
            return defaultValue
        } else {
            return num
        }
    } else {
        return defaultValue
    }
}
</script>

<template>
    <el-input
        v-model="showModel"
        @change="sync"
        clearable
        @clear="model=defaultValue;cache=''"
        :placeholder="placeholder || defaultValue.toString()"
    />
</template>

<style scoped>

</style>
