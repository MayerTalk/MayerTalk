<script setup lang="ts">
import CollapseColumnItem from './CollapseColumnItem.vue'
import CollapseRowItem from './CollapseRowItem.vue'

const { row = false } = defineProps<{
    row?: boolean
}>()
</script>

<template>
    <component :is="row?CollapseRowItem:CollapseColumnItem">
        <slot/>
    </component>
</template>
