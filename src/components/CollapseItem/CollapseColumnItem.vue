<script setup lang="ts">
// copy from https://github.com/element-plus/element-plus/blob/dev/packages/components/collapse-transition/src/collapse-transition.vue

import type { CollapseItem } from '@/components/CollapseItem/CollapseItem';

const reset = (el: CollapseItem) => {
    el.style.maxHeight = ''
    el.style.overflow = el.dataset.oldOverflow || 'visible'
    el.style.paddingTop = el.dataset.oldPaddingTop || ''
    el.style.paddingBottom = el.dataset.oldPaddingBottom || ''
}

const on = {
    beforeEnter(el: CollapseItem) {
        if (!el.dataset) el.dataset = {}

        el.dataset.oldPaddingTop = el.style.paddingTop
        el.dataset.oldPaddingBottom = el.style.paddingBottom

        el.style.maxHeight = '0'
        el.style.paddingTop = '0'
        el.style.paddingBottom = '0'
    },

    enter(el: CollapseItem) {
        el.dataset.oldOverflow = el.style.overflow
        if (el.scrollHeight !== 0) {
            el.style.maxHeight = `${el.scrollHeight}px`
        } else {
            el.style.maxHeight = '0'
        }
        el.style.paddingTop = el.dataset.oldPaddingTop || ''
        el.style.paddingBottom = el.dataset.oldPaddingBottom || ''
        el.style.overflow = 'hidden'
    },

    afterEnter(el: CollapseItem) {
        el.style.maxHeight = ''
        el.style.overflow = el.dataset.oldOverflow || 'visible'
    },

    enterCancelled(el: CollapseItem) {
        reset(el)
    },

    beforeLeave(el: CollapseItem) {
        if (!el.dataset) el.dataset = {}
        el.dataset.oldPaddingTop = el.style.paddingTop
        el.dataset.oldPaddingBottom = el.style.paddingBottom
        el.dataset.oldOverflow = el.style.overflow

        el.style.maxHeight = `${el.scrollHeight}px`
        el.style.overflow = 'hidden'
    },

    leave(el: CollapseItem) {
        if (el.scrollHeight !== 0) {
            el.style.maxHeight = '0'
            el.style.paddingTop = '0'
            el.style.paddingBottom = '0'
        }
    },

    afterLeave(el) {
        reset(el)
    },

    leaveCancelled(el) {
        reset(el)
    }
}
</script>

<template>
    <transition v-on="on" name="collapse-column">
        <slot/>
    </transition>
</template>

<style scoped>
.collapse-column-enter-active,
.collapse-column-leave-active {
    transition: max-height ease-in-out 0.5s,
    padding-top ease-in-out 0.5s,
    padding-bottom 0.5s ease-in-out;
}
</style>
