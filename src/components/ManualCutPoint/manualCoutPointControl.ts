import { ref, watch } from 'vue'
import { DataControl, chats } from '@/lib/data/data'
import { DialogueHook } from '@/lib/function/dialogue'
import Hook from '@/lib/utils/hook'
import { bool, getDialogue } from '@/lib/utils/tool'
import { currEditorRef, ModeChange } from '@/lib/data/state'
import { closeShowHook, mainShow } from '@/lib/data/showControl'
import type { Ref } from 'vue'
import type { ChatsRecord } from '@/lib/data/dataTypes';

const currCutPoint = ref('')
const currCutPointIndex = ref(-1)
const cutPointViewMode = ref(false)

const cutPoints: Ref<Record<string, ChatsRecord>> = ref({})
const sortedCutPoints: Ref<Array<ChatsRecord>> = ref([])
const cutPointQuickEditMode = ref(false)
let lastUpdate = ''

watch(cutPointViewMode, () => {
    ModeChange.call({
        target: cutPointViewMode,
        height: 45
    })
})

closeShowHook.on(() => {
    if (cutPointViewMode.value) {
        cutPointViewMode.value = false
    }
})

DataControl.hook.clear.on((params) => {
    if (params && params.indexOf('cutPoint') !== -1) {
        sortedCutPoints.value = []
        cutPoints.value = {}
        currCutPointIndex.value = 0
        chats.value.forEach((data) => {
            if (data.data.cutPoint) {
                delete data.data.cutPoint
            }
        })
    }
})

function enableCutPointView() {
    closeShowHook.call(undefined)
    cutPointViewMode.value = true
}

function disableCutPointView() {
    cutPointViewMode.value = false
    setTimeout(() => {
        mainShow.screenshotHelper.value = true
    }, 250)
}

function reloadCutPoint() {
    const arrayPoints: Array<ChatsRecord> = []
    const dictPoints: Record<string, ChatsRecord> = {}
    let update = ''
    chats.value.forEach((data) => {
        if (data.data.cutPoint) {
            dictPoints[data.id] = data
            arrayPoints.push(data)
            update += data.id
        }
    })
    if (update === lastUpdate) {
        return
    }
    lastUpdate = update
    arrayPoints.forEach((data, index) => {
        if (data.id === currCutPoint.value) {
            currCutPointIndex.value = index + 1
        }
    })
    sortedCutPoints.value = arrayPoints
    cutPoints.value = dictPoints
}

reloadCutPoint()

DialogueHook.create.on(() => {
    reloadCutPoint()
})
DialogueHook.update.on((params) => {
    if (Object.prototype.hasOwnProperty.call(cutPoints.value, params.data.id) &&
        !Object.prototype.hasOwnProperty.call(params.data.data, 'cutPoint') &&
        params.data.id === currCutPoint.value) {
        currCutPoint.value = ''
        currCutPointIndex.value = -1
    }
    reloadCutPoint()
})

DataControl.hook.change.on(() => {
    reloadCutPoint()
})

function setCurrCutPoint(index: number) {
    currCutPointIndex.value = index
    if (index) {
        currCutPoint.value = sortedCutPoints.value[index - 1].id
        cutPointFocusHook.call(sortedCutPoints.value[index - 1].id)
    } else {
        currCutPoint.value = ''
    }
}

function getClosetCutPoint() {
    if (currEditorRef.value) {
        const scrollTop = currEditorRef.value.currScrollTop + window.innerHeight / 2
        for (let i = 1; i < sortedCutPoints.value.length; i++) {
            const dialogue = getDialogue(sortedCutPoints.value[i].id)
            if (dialogue && dialogue.offsetTop > scrollTop) {
                if (scrollTop - dialogue.offsetTop >
                    dialogue.offsetTop - scrollTop) {
                    return i
                } else {
                    return i - 1
                }
            }
        }
    }
    return sortedCutPoints.value.length - 1
}

function checkIndex(index: number) {
    if (index < 1) {
        return sortedCutPoints.value.length
    } else if (index > sortedCutPoints.value.length) {
        return 1
    } else {
        return index
    }
}

function getIndex() {
    if (currCutPointIndex.value === -1) {
        return getClosetCutPoint() + 1
    } else {
        return currCutPointIndex.value
    }
}

function prev() {
    if (bool(cutPoints.value)) {
        setCurrCutPoint(checkIndex(getIndex() - 1))
    }
}

function next() {
    if (bool(cutPoints.value)) {
        setCurrCutPoint(checkIndex(getIndex() + 1))
    }
}

const cutPointFocusHook = new Hook<string>()

export {
    cutPoints,
    sortedCutPoints,
    cutPointViewMode,
    currCutPoint,
    currCutPointIndex,
    setCurrCutPoint,
    cutPointFocusHook,
    cutPointQuickEditMode,
    getClosetCutPoint,
    enableCutPointView,
    disableCutPointView,
    prev,
    next
}
