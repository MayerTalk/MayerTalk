<script setup>
    import {ref, provide} from 'vue'
    import Renders from './render'
    import Announce from './Announce.vue'

    const showAnnouncement = ref(false);
    const config = ref({
        'render': 'Arknights',
        'style': 'default'
    })
    const chars = ref({});
    const chats = ref([]);

    provide('showAnnouncement', showAnnouncement);
    provide('config', config);
    provide('chars', chars);
    provide('chats', chats)


</script>

<template>
    <Announce v-model="showAnnouncement"/>
    <component :is="Renders[config.render]"/>
</template>

<style src="./font.css"></style>