import { ref, watch } from 'vue'
import { DataControl, chats } from '@/lib/data/data'
import { DialogueHook } from '@/lib/function/dialogue'
import Hook from '@/lib/utils/hook'
import { getDialogue } from '@/lib/utils/tool'
import { currEditorRef, ModeChange } from '@/lib/data/state'
import { closeShowHook, mainShow } from '@/lib/data/showControl'

const currCutPoint = ref(null)
const currCutPointIndex = ref(0)
const cutPointViewMode = ref(false)

const cutPoints = ref({})
const sortedCutPoints = ref([])
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

function enableCutPointView () {
    closeShowHook.call()
    cutPointViewMode.value = true
}

function disableCutPointView () {
    cutPointViewMode.value = false
    setTimeout(() => {
        mainShow.screenshotHelper.value = true
    }, 250)
}

function reloadCutPoint () {
    const arrayPoints = []
    const dictPoints = {}
    let update = ''
    chats.value.forEach((data) => {
        if (!Object.prototype.hasOwnProperty.call(data, 'data')) {
            data.data = {}
        }
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
        currCutPointIndex.value = '~'
    }
    reloadCutPoint()
})

DataControl.hook.change.on(() => {
    reloadCutPoint()
})

function setCurrCutPoint (index) {
    currCutPointIndex.value = index
    if (index) {
        currCutPoint.value = sortedCutPoints.value[index - 1].id
        cutPointFocusHook.call(sortedCutPoints.value[index - 1].id)
    } else {
        currCutPoint.value = null
    }
}

function getClosetCutPoint () {
    const scrollTop = currEditorRef.value.currScrollTop + window.innerHeight / 2
    for (let i = 1; i < sortedCutPoints.value.length; i++) {
        if (getDialogue(sortedCutPoints.value[i].id).offsetTop > scrollTop) {
            if (scrollTop - getDialogue(sortedCutPoints.value[i - 1].id).offsetTop >
                getDialogue(sortedCutPoints.value[i].id).offsetTop - scrollTop) {
                return i
            } else {
                return i - 1
            }
        }
    }
    return sortedCutPoints.value.length - 1
}

function checkIndex (index) {
    if (index < 1) {
        return sortedCutPoints.value.length
    } else if (index > sortedCutPoints.value.length) {
        return 1
    } else {
        return index
    }
}

function getIndex () {
    if (currCutPointIndex.value === '~') {
        return getClosetCutPoint() + 1
    } else {
        return currCutPointIndex.value
    }
}

function prev () {
    if (cutPoints.value.length) { setCurrCutPoint(checkIndex(getIndex() - 1)) }
}

function next () {
    if (cutPoints.value.length) { setCurrCutPoint(checkIndex(getIndex() + 1)) }
}

const cutPointFocusHook = new Hook()

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
