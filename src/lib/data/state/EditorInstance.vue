<script setup lang="ts">
import { ElScrollbar } from 'element-plus';
import { ref, type ComponentPublicInstance } from 'vue'


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
    <div />
</template>

<style scoped></style>
