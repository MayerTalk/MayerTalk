<script setup>
    import {inject, watch} from 'vue'
    import {getData, saveData} from "@/lib/tool";

    const defaultSettings = {
        background: '#303030',
        width: 400,
        style: 'default',
        scale: 1.5
    };

    const config = inject('config');
    const settings = inject('settings');

    config.value.settings = getData('setting.Arknights') || {};

    function sync() {
        const value = config.value.settings;
        settings.value.background = value.background || defaultSettings.background;
        settings.value.width = value.width || defaultSettings.width;
        settings.value.style = value.style || defaultSettings.style;
        settings.value.scale = value.scale || defaultSettings.scale
    }

    sync();
    watch(config, sync);
</script>

<template>
    <!--    TODO-->
</template>