<script setup>
    import {inject, watch} from 'vue'
    import {getData, saveData} from "@/lib/tool";

    const defaultSettings = {
        background: '#303030',
        width: 520,
        style: 'default'
    };

    const config = inject('config');
    const settings = inject('settings');

    config.value.settings = getData('setting.Arknights') || {};

    function sync() {
        const value = config.value.settings;
        settings.value.background = value.background || defaultSettings.background;
        settings.value.width = value.width || defaultSettings.width;
        settings.value.style = value.style || defaultSettings.style;
    }

    sync();
    watch(config, sync);
</script>

<template>
    <!--    TODO-->
</template>