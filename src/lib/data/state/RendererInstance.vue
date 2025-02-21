<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue';
import type { RendererGenericSettings } from '@/lib/data/settings';


const rendererSettings: RendererGenericSettings = {} as RendererGenericSettings
const SettingsDialog: ComponentPublicInstance = {} as ComponentPublicInstance

defineExpose({
    rendererSettings,
    SettingsDialog
})
</script>

<template>
<div/>
</template>

<style scoped>

</style>
