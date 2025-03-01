<script setup lang="ts">
// copy from https://github.com/element-plus/element-plus/blob/dev/packages/components/collapse-transition/src/collapse-transition.vue

import type { CollapseItem } from '@/components/CollapseItem/CollapseItem';

const reset = (el: CollapseItem) => {
    el.style.maxWidth = ''
    el.style.overflow = el.dataset.oldOverflow || 'visible'
    el.style.paddingLeft = el.dataset.oldPaddingLeft || ''
    el.style.paddingRight = el.dataset.oldPaddingRight  || ''
}

const on = {
    beforeEnter(el: CollapseItem) {
        if (!el.dataset) el.dataset = {}

        el.dataset.oldPaddingLeft = el.style.paddingLeft
        el.dataset.oldPaddingRight = el.style.paddingRight

        el.style.maxWidth = '0'
        el.style.paddingLeft = '0'
        el.style.paddingRight = '0'
    },

    enter(el: CollapseItem) {
        el.dataset.oldOverflow = el.style.overflow
        if (el.scrollWidth !== 0) {
            el.style.maxWidth = `${el.scrollWidth}px`
        } else {
            el.style.maxWidth = '0'
        }
        el.style.paddingLeft = el.dataset.oldPaddingLeft || ''
        el.style.paddingRight = el.dataset.oldPaddingRight || ''
        el.style.overflow = 'hidden'
    },

    afterEnter(el: CollapseItem) {
        el.style.maxWidth = ''
        el.style.overflow = el.dataset.oldOverflow || 'visible'
    },

    enterCancelled(el: CollapseItem) {
        reset(el)
    },

    beforeLeave(el: CollapseItem) {
        if (!el.dataset) el.dataset = {}
        el.dataset.oldPaddingLeft = el.style.paddingLeft
        el.dataset.oldPaddingRight = el.style.paddingRight
        el.dataset.oldOverflow = el.style.overflow

        el.style.maxWidth = `${el.scrollWidth}px`
        el.style.overflow = 'hidden'
    },

    leave(el: CollapseItem) {
        if (el.scrollWidth !== 0) {
            el.style.maxWidth = '0'
            el.style.paddingLeft = '0'
            el.style.paddingRight = '0'
        }
    },

    afterLeave(el: CollapseItem) {
        reset(el)
    },

    leaveCancelled(el: CollapseItem) {
        reset(el)
    }
}
</script>

<template>
    <transition v-on="on" name="collapse-row">
        <slot/>
    </transition>
</template>

<style scoped>
.collapse-row-enter-active,
.collapse-row-leave-active {
    transition: max-width ease-in-out 0.5s,
    padding-left ease-in-out 0.5s,
    padding-right ease-in-out 0.5s;
}
</style>
