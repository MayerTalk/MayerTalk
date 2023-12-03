<script setup>
// copy from https://github.com/element-plus/element-plus/blob/dev/packages/components/collapse-transition/src/collapse-transition.vue
const reset = (el) => {
    el.style.maxWidth = ''
    el.style.overflow = el.dataset.oldOverflow
    el.style.paddingLeft = el.dataset.oldpaddingLeft
    el.style.paddingRight = el.dataset.oldpaddingRight
}

const on = {
    beforeEnter (el) {
        if (!el.dataset) el.dataset = {}

        el.dataset.oldpaddingLeft = el.style.paddingLeft
        el.dataset.oldpaddingRight = el.style.paddingRight

        el.style.maxWidth = 0
        el.style.paddingLeft = 0
        el.style.paddingRight = 0
    },

    enter (el) {
        el.dataset.oldOverflow = el.style.overflow
        if (el.scrollWidth !== 0) {
            el.style.maxWidth = `${el.scrollWidth}px`
        } else {
            el.style.maxWidth = 0
        }
        el.style.paddingLeft = el.dataset.oldpaddingLeft
        el.style.paddingRight = el.dataset.oldpaddingRight
        el.style.overflow = 'hidden'
    },

    afterEnter (el) {
        el.style.maxWidth = ''
        el.style.overflow = el.dataset.oldOverflow
    },

    enterCancelled (el) {
        reset(el)
    },

    beforeLeave (el) {
        if (!el.dataset) el.dataset = {}
        el.dataset.oldpaddingLeft = el.style.paddingLeft
        el.dataset.oldpaddingRight = el.style.paddingRight
        el.dataset.oldOverflow = el.style.overflow

        el.style.maxWidth = `${el.scrollWidth}px`
        el.style.overflow = 'hidden'
    },

    leave (el) {
        if (el.scrollWidth !== 0) {
            el.style.maxWidth = 0
            el.style.paddingLeft = 0
            el.style.paddingRight = 0
        }
    },

    afterLeave (el) {
        reset(el)
    },

    leaveCancelled (el) {
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
