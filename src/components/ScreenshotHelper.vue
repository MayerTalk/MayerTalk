<script setup>
import { inject, nextTick } from 'vue'
import { getCanvas, downloadCanvas, copy, getDialogue } from '@/lib/tool'
import message from '@/lib/message'
import { t } from '@/lib/lang/translate'
import { chats } from '@/lib/data'

const emit = defineEmits(['start', 'done'])

let screenshotNode = null

const rendererWidth = inject('rendererWidth')
const rendererSettings = inject('rendererSettings')

function downloadScreenshot (cb = null, options = {}) {
    getCanvas(options.screenshotNode || screenshotNode, {
        windowWidth: rendererWidth.value.window + 20,
        scale: rendererSettings.value.scale,
        useCORS: true,
        ...(options.options || {})
    }, (canvas) => {
        downloadCanvas(canvas, cb, options.seq, options.filename)
    })
}

function getNode () {
    if (document.getElementById('renderer')) {
        screenshotNode = document.getElementById('renderer')
    } else {
        setTimeout(() => {
            getNode()
        }, 10)
    }
}

function getScreenshotGroup () {
    const totalHeight = (screenshotNode.scrollHeight - 30)
    // 缩小比例后实际 maxHeight
    let maxHeight = rendererSettings.value.maxHeight / rendererSettings.value.scale - 30
    maxHeight = maxHeight < 0 ? 0 : maxHeight
    if (totalHeight < maxHeight || chats.value.length < 2) {
        // 无需裁分
        return false
    }
    // 裁分点
    const points = []
    // 已裁分Height
    let croppedHeight = 0
    // 最后一次裁分index
    let index = 0
    let lastCrop = 0
    if (totalHeight / maxHeight > 2) {
        for (let i = 1; i < chats.value.length; i++) {
            const dialogue = getDialogue(chats.value[i].id)
            if (dialogue.offsetTop - croppedHeight > maxHeight) {
                if (i - 1 <= lastCrop) {
                    // 最小粒度 (1对话)
                    continue
                }
                points.push(i - 1)
                croppedHeight = getDialogue(chats.value[i - 1].id).offsetTop
                lastCrop = i - 1
                if (totalHeight - croppedHeight < 2 * maxHeight) {
                    index = i
                    break
                }
            }
        }
    }
    // totalHeight - croppedHeight < 2 * maxHeight 二分
    index = chats.value.length - Math.floor((chats.value.length - index) / 2)
    while (true) {
        const dialogue = getDialogue(chats.value[index].id)
        if (dialogue.offsetTop - croppedHeight > maxHeight) {
            // part1 过长
            if (totalHeight - dialogue.offsetTop >= maxHeight) {
                // 同时part2过长
                // 极端情况，此时三等分
                const diff = Math.ceil((chats.value.length - index) / 3)
                const i1 = index - diff
                if (i1 > points[points.length - 1]) {
                    if (i1 < chats.value.length) {
                        // 确保最小粒度 (1对话)
                        points.push(i1)
                    }
                } else if (i1 + 1 < chats.value.length) {
                    points.push(i1 + 1)
                }
                const i2 = index + diff
                if (i2 < points.length) {
                    if (i2 > points[points.length - 1]) {
                        // 确保最小粒度 (1对话)
                        points.push(i2)
                    }
                } else if (i2 - 1 > points[points.length - 1]) {
                    points.push(i2 - 1)
                }
                break
            }
            // index前移
            index--
            continue
        }
        if (totalHeight - dialogue.offsetTop > maxHeight) {
            // part2过长，index后移
            index++
            continue
        }
        // check pass -> push
        points.push(index)
        break
    }
    return points
}

function screenshot (ensure = false) {
    emit('start')
    const group = getScreenshotGroup()
    if (group) {
        if (group.length > 10 && !ensure) {
            message.confirm(t.value.notify.screenshotExceeds10, t.value.noun.hint, () => {
                screenshot(true)
            }, () => {
                emit('done')
            })
            return
        }
        const seq = Date.now() + '-'
        const chatsData = copy(chats.value)
        const next = (i) => {
            if (i > group.length) {
                message.notify(t.value.notify.screenshottedCompletely, message.success)
                emit('done')
                screenshotNode.style.height = null
                setTimeout(() => {
                    chats.value = chatsData
                    setTimeout(() => {
                        message.notify(t.value.notify.recoveredSuccessfully, message.success)
                    }, 50)
                }, 500)
                // 截图结束
                return
            }
            chats.value = chatsData.slice(group[i - 1], group[i])
            setTimeout(() => {
                screenshotNode.style.height = null
                screenshotNode.style.height = screenshotNode.scrollHeight - 30 + 'px'
                setTimeout(() => {
                    downloadScreenshot(() => {
                        message.notify(t.value.notify.screenshottedSuccessfully + ' [' + (i + 1) + '/' + (group.length + 1) + ']', message.info)
                        next(i + 1)
                    }, {
                        seq: seq + (i + 1)
                    })
                }, 100)
            }, 100)
        }
        message.notify(t.value.notify.startToScreenshot, message.warning)
        setTimeout(() => {
            next(0)
        }, 500)
    } else {
        nextTick(() => {
            // 将height定为整数，防止截图下方出现白条
            screenshotNode.style.height = screenshotNode.scrollHeight - 30 + 'px'
            setTimeout(() => {
                downloadScreenshot(() => {
                    screenshotNode.style.height = null
                    emit('done')
                })
            }, 100)
        })
    }
}

getNode()

defineExpose({
    screenshot
})
</script>

<template>

</template>
