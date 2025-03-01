<script setup lang="ts">
import { computed } from 'vue';

const model = defineModel<string>()
const { defaultValue, placeholder } = defineProps<{
    defaultValue: string,
    placeholder?: string
}>()

const showModel = computed({
    get(){
        return model.value === defaultValue ? undefined : model.value
    },
    set(param: string) {
        model.value = param
    }
})
</script>

<template>
    <el-input
        v-model="showModel"
        clearable
        @clear="model=defaultValue"
        :placeholder="placeholder || defaultValue"
    />
</template>

<style scoped>

</style>
