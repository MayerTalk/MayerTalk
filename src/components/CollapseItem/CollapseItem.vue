<script setup>
import CollapseColumnItem from './CollapseColumnItem.vue'
import CollapseRowItem from './CollapseRowItem.vue'

const { row } = defineProps({
    row: {
        type: Boolean,
        default: false
    }
})
</script>

<template>
    <component :is="row?CollapseRowItem:CollapseColumnItem">
        <slot/>
    </component>
</template>
