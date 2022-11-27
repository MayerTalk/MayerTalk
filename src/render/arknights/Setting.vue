<script setup>
    import {inject} from 'vue'
    import {getData, saveData} from "@/lib/tool";

    const defaultConfig = {
        background: null
    };

    const config = inject('config');
    config.value.settings.value = getData('setting.Arknights') || defaultConfig
</script>

<template>
<!--    TODO-->
</template>