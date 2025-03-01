import { computed, ref } from 'vue'

import { doAfter } from '@/lib/utils/tool'
import WindowResize from '@/lib/utils/windowResize'

import { DataControl } from '@/lib/data/data'
import { defaultWindowWidth } from '@/lib/data/constance'

import { editorSettings } from '@/editor/Default'

const validSpace = ref(0)

function refreshValidSpace() {
    validSpace.value = window.innerWidth - defaultWindowWidth
}

refreshValidSpace()
WindowResize.on(refreshValidSpace)

let sidebarPlaceholderNode: HTMLElement | null = null
const sidebarWidth = ref(0)

function getSidebarWidth() {
    // +1 border
    return sidebarPlaceholderNode ? sidebarPlaceholderNode.scrollWidth + 1 : 80
}

doAfter(() => {
    return document.getElementById('sidebar-placeholder')
}, (el) => {
    sidebarPlaceholderNode = el
    sidebarWidth.value = getSidebarWidth()
})

DataControl.hook.update.on(() => {
    // language改变时，sidebar宽度也有可能改变
    sidebarWidth.value = getSidebarWidth()
})

const ifShowPermanentSelectChar = computed<boolean>(() => {
    return editorSettings.value.characterSelectorPermanent && validSpace.value - sidebarWidth.value - (421 + 22 * 2) > 0
})

const mobileView = computed(() => {
    return validSpace.value - sidebarWidth.value < 0
})

export {
    mobileView,
    sidebarWidth,
    ifShowPermanentSelectChar
}
