import { ref, watch } from 'vue'
import { closeShowHook, mainShow } from '@/lib/data/showControl'
import { DialogueHook, findDialoguesById } from '@/lib/function/dialogue'
import { copy } from '@/lib/utils/tool'
import { ModeChange } from '@/lib/data/state'
import { chats } from '@/lib/data/data'

const partialChats = ref({})
let lastClick = null
const partialScreenshotViewMode = ref(false)
const duringPartialScreenshot = ref(false)
const partialScreenshotMultiSelect = ref(false)
let oldData = {}

watch(partialScreenshotViewMode, () => {
    ModeChange.call({
        target: partialScreenshotViewMode,
        height: 45
    })
})

closeShowHook.on(() => {
    if (partialScreenshotViewMode.value) {
        partialScreenshotViewMode.value = false
    }
})

function enablePartialScreenshotView () {
    closeShowHook.call()
    partialScreenshotMultiSelect.value = false
    lastClick = null
    partialChats.value = {}
    partialScreenshotViewMode.value = true
}

function disablePartialScreenshotView () {
    partialScreenshotViewMode.value = false
    lastClick = null
    partialChats.value = {}
    setTimeout(() => {
        mainShow.screenshotHelper.value = true
    }, 250)
}

DialogueHook.click.on((event) => {
    if (partialScreenshotViewMode.value) {
        event.preventDefault()
        if ((event.raw.shiftKey || partialScreenshotMultiSelect.value) && lastClick) {
            const dialogues = findDialoguesById(lastClick[0], event.data.id)
            if (lastClick[1]) {
                dialogues.forEach((id) => {
                    partialChats.value[id] = true
                })
            } else {
                dialogues.forEach((id) => {
                    delete partialChats.value[id]
                })
            }
            lastClick = [event.data.id, lastClick[1]]
            if (partialScreenshotMultiSelect.value) {
                partialScreenshotMultiSelect.value = false
            }
        } else {
            if (Object.prototype.hasOwnProperty.call(partialChats.value, event.data.id)) {
                delete partialChats.value[event.data.id]
                lastClick = [event.data.id, false]
            } else {
                partialChats.value[event.data.id] = true
                lastClick = [event.data.id, true]
            }
        }
        partialChats.value = copy(partialChats.value)
    }
})

watch(duringPartialScreenshot, (value) => {
    if (value) {
        oldData = copy(chats.value)
        const newData = []
        for (let i = 0; i < oldData.length; i++) {
            if (Object.prototype.hasOwnProperty.call(partialChats.value, oldData[i].id)) {
                newData.push(oldData[i])
            }
        }
        chats.value = newData
        disablePartialScreenshotView()
    } else {
        chats.value = oldData
    }
})

export {
    partialChats,
    duringPartialScreenshot,
    partialScreenshotViewMode,
    partialScreenshotMultiSelect,
    enablePartialScreenshotView,
    disablePartialScreenshotView
}
