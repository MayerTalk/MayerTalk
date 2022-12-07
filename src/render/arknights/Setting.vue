<script setup>
    import {inject, watch, onMounted} from 'vue'

    const defaultSettings = {
        background: '#303030',
        width: 400,
        style: 'default',
        scale: 1.5
    };

    const settings = inject('settings');
    const renderSettings = inject('renderSettings');

    function sync() {
        for (let key in defaultSettings) {
            if (defaultSettings.hasOwnProperty(key)) {
                renderSettings.value[key] = settings.value[key] || defaultSettings[key]
            }
        }
    }

    // 同步，否则加载延迟+++
    sync();
    watch(settings, () => sync());
</script>

<template>
    <!--    TODO-->
</template>