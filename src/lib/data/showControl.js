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
    for (const key in mainShow) {
        if (Object.prototype.hasOwnProperty.call(mainShow, key)) {
            if (mainShow[key].value) {
                mainShow[key].value = false
            }
        }
    }
})

export {
    mainShow,
    closeShowHook
}
