import { ref, watch } from 'vue'
import { doAfter } from '@/lib/tool'
import { DataControl } from '@/lib/data'
import { defaultWindowWidth } from '@/lib/constance'
import WindowResize from '@/lib/windowResize'

let sidebarPlaceholderNode = {}
const sidebarWidth = ref(0)
const mobileView = ref(false)

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

function refreshMobileView () {
    mobileView.value = window.innerWidth - defaultWindowWidth - getSidebarWidth() < 0
}

refreshMobileView()
watch(sidebarWidth, refreshMobileView)
WindowResize.onResize(refreshMobileView)

export {
    mobileView,
    sidebarWidth
}
