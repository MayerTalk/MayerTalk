import { ref } from 'vue'


import Hook from '@/lib/utils/hook'

const mainShow = {
    announcement: ref(false),
    settings: ref(false),
    about: ref(false),
    screenshotHelper: ref(false),
    savefile: ref(false)
}

const closeShowHook = new Hook()

closeShowHook.on(() => {
    for (const [, value] of Object.entries(mainShow)) {
        if (value.value) {
            value.value = false
        }
    }
})

export {
    mainShow,
    closeShowHook
}
