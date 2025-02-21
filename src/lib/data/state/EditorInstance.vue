<script setup lang="ts">
import { ref } from 'vue'
import type { ComponentPublicInstance } from 'vue';
import { ElScrollbar } from 'element-plus';


const SettingsDialog: ComponentPublicInstance = {} as ComponentPublicInstance
const currScrollTop = ref(0)
const scroll = ref<InstanceType<typeof ElScrollbar> | null>(null)

defineExpose({
    scroll,
    currScrollTop,
    SettingsDialog
})
</script>

<template>
    <div/>
</template>

<style scoped>

</style>
