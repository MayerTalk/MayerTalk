import { ref } from 'vue'

import { closeShowHook } from '@/lib/data/showControl'

import { mobileView } from '@/editor/Default/lib/width'

const defaultShow = {
    sidebar: ref(!mobileView.value),
    copy: ref(false)
}

closeShowHook.on(() => {
    if (mobileView.value && defaultShow.sidebar.value) {
        defaultShow.sidebar.value = false
    }
    for (const key in defaultShow) {
        if (key !== 'sidebar' && Object.prototype.hasOwnProperty.call(defaultShow, key)) {
            if (defaultShow[key].value) {
                defaultShow[key].value = false
            }
        }
    }
})

export {
    defaultShow
}
