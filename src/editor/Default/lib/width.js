import { computed, ref } from 'vue'
import { doAfter } from '@/lib/tool'
import { DataControl } from '@/lib/data'
import { defaultWindowWidth } from '@/lib/constance'
import { syncedSettings } from '@/lib/settings'
import WindowResize from '@/lib/windowResize'

const validSpace = ref(0)

function refreshValidSpace () {
    validSpace.value = window.innerWidth - defaultWindowWidth
}

refreshValidSpace()
WindowResize.onResize(refreshValidSpace)

let sidebarPlaceholderNode = {}
const sidebarWidth = ref(0)

function getSidebarWidth () {
    // +1 border
    return sidebarPlaceholderNode.scrollWidth + 1 || 80
}

doAfter(() => {
    return document.getElementById('sidebar-placeholder')
}, (el) => {
    sidebarPlaceholderNode = el
    sidebarWidth.value = getSidebarWidth()
})

DataControl.onUpdate(() => {
    // language改变时，sidebar宽度也有可能改变
    sidebarWidth.value = getSidebarWidth()
})

const ifShowPermanentSelectChar = computed(() => {
    return syncedSettings.value.characterSelectorPermanent && validSpace.value - sidebarWidth.value - 421 > 0
})

const mobileView = computed(() => {
    return validSpace.value - sidebarWidth.value < 0
})

export {
    mobileView,
    sidebarWidth,
    ifShowPermanentSelectChar
}
