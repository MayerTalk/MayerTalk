<script setup lang="ts">
import CollapseRowItem from './CollapseRowItem.vue'
import CollapseColumnItem from './CollapseColumnItem.vue'

const { row = false } = defineProps<{
    row?: boolean
}>()
</script>

<template>
    <component :is="row?CollapseRowItem:CollapseColumnItem">
        <slot/>
    </component>
</template>
