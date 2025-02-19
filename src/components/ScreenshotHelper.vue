<script setup>
import { computed, inject, nextTick, onUnmounted, ref, watch } from 'vue'
import { getCanvas, downloadCanvas, copy, getDialogue, parseFilename, doAfter } from '@/lib/utils/tool'
import { TypeSeries } from '@/lib/data/constance'
import message from '@/lib/utils/message'
import { t } from '@/lib/lang/translate'
import { chats, chars, settings, DataControl } from '@/lib/data/data'
import { defaultSettings, commonSettings, setCommonSettings, rendererSettings } from '@/lib/data/settings'
import CollapseItem from '@/components/CollapseItem'
import { dialogWidth } from '@/lib/data/width'
import { cutPointViewMode, sortedCutPoints, enableCutPointView } from '@/components/ManualCutPoint/manualCoutPointControl'
import {
    enablePartialScreenshotView,
    duringPartialScreenshot
} from '@/components/PartialScreenshot/partialScreenshotControl'
import { mainShow } from '@/lib/data/showControl'
import { duringScreenshot } from '@/lib/data/state'

const emit = defineEmits(['start', 'done'])

let screenshotNode = null
let watermarkNode = null
const rendererWidth = inject('rendererWidth')
const title = ref('')
const realScale = computed(() => {
    return commonSettings.value.imageQuality * 1.5
})

onUnmounted(DataControl.hook.clear.on(() => {
    title.value = ''
}))
onUnmounted(DataControl.hook.changeSavefile.on(() => {
    title.value = ''
}))

function downloadScreenshot (cb = null, options = {}) {
    getCanvas(options.screenshotNode || screenshotNode, {
        windowWidth: rendererWidth.value.window + 20,
        scale: realScale.value,
        useCORS: true,
        ...(options.options || {})
    }, (canvas) => {
        if (options.watermarkCanvas) {
            const finalCanvas = document.createElement('canvas')
            const ctx = finalCanvas.getContext('2d')
            finalCanvas.width = canvas.width
            finalCanvas.height = options.watermarkCanvas.height + canvas.height - 1
            ctx.drawImage(options.watermarkCanvas, 0, 0)
            ctx.drawImage(canvas, 0, options.watermarkCanvas.height - 1)
            downloadCanvas(finalCanvas, cb, options)
        } else {
            downloadCanvas(canvas, cb, options)
        }
    })
}

doAfter(() => {
    return document.getElementById('renderer') && document.getElementById('watermark')
}, () => {
    screenshotNode = document.getElementById('renderer')
    watermarkNode = document.getElementById('watermark')
    ExpectLength.calc()
}, 10)

const realMaxHeight = computed(() => {
    // -30 renderer上下padding (20+10)
    // -10 dialogue margin-bottom
    const res = Math.floor(commonSettings.value.maxHeight / realScale.value) - 30 -
        (commonSettings.value.watermark ? watermarkNode.scrollHeight - 1 : 0) - 10
    return res > 0 ? res : 1
})

function dialogueOffsetTop (el) {
    // offsetTop 包含 renderer paddingTop 20px
    return el.offsetTop - 20
}

function getAutoCutGroup (start, end, maxHeight) {
    if (!commonSettings.value.autoCut) {
        return []
    }
    const chatsData = end ? chats.value.slice(start, end) : chats.value.slice(start)
    const offset = dialogueOffsetTop(getDialogue(chatsData[0].id))
    const totalHeight = end
        ? dialogueOffsetTop(getDialogue(chats.value[end].id)) - dialogueOffsetTop(getDialogue(chatsData[0].id))
        : screenshotNode.scrollHeight - 30 - offset

    function offsetTop (el) {
        return dialogueOffsetTop(el) - offset
    }

    if (totalHeight < maxHeight || chatsData.length < 2) {
        // 无需裁分
        return []
    }
    // 裁分点 len:9 [3,6] -> [0-2,3-5,6-8]
    const points = []
    // 已裁分Height
    let croppedHeight = 10
    // 最后一次裁分index
    let index = 0
    let lastCrop = 0
    if (totalHeight / maxHeight > 2) {
        for (let i = 1; i < chatsData.length; i++) {
            const dialogue = getDialogue(chatsData[i].id)
            if (offsetTop(dialogue) - croppedHeight > maxHeight) {
                if (i - 1 <= lastCrop) {
                    // 最小粒度 (1对话)
                    continue
                }
                points.push(i - 1)
                croppedHeight = offsetTop(getDialogue(chatsData[i - 1].id)) + 10
                lastCrop = i - 1
                if (totalHeight - croppedHeight < 2 * maxHeight) {
                    index = i
                    break
                }
            }
        }
    }
    if (
        chatsData.length === index || // 小于一份
        totalHeight - croppedHeight < maxHeight // 剩下的分少于一倍maxHeight
    ) {
        return points
    }
    // totalHeight - croppedHeight < 2 * maxHeight 二分
    index = chatsData.length - Math.floor((chatsData.length - lastCrop) / 2)
    while (true) {
        const dialogue = getDialogue(chatsData[index].id)
        if (offsetTop(dialogue) - croppedHeight > maxHeight) {
            // part1 过长
            if (totalHeight - offsetTop(dialogue) >= maxHeight) {
                // 同时part2过长
                // 极端情况，此时三等分
                const diff = Math.ceil((chatsData.length - index) / 3)
                const i1 = index - diff
                if (i1 > points[points.length - 1]) {
                    if (i1 < chatsData.length) {
                        // 确保最小粒度 (1对话)
                        points.push(i1)
                    }
                } else if (i1 + 1 < chatsData.length) {
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
        if (totalHeight - offsetTop(dialogue) > maxHeight) {
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

function getScreenshotGroup () {
    const maxHeight = realMaxHeight.value
    let lastCut = 0
    // 裁分点 len:9 [3,6] -> [0-2,3-5,6-8]
    const points = []
    if (commonSettings.value.manualCut && !duringPartialScreenshot.value) {
        for (let i = 0; i < chats.value.length - 1; i++) {
            if (chats.value[i].data.cutPoint) {
                getAutoCutGroup(lastCut, i + 1, maxHeight).forEach((point) => {
                    points.push(point + lastCut)
                })
                points.push(i + 1)
                lastCut = i + 1
            }
        }
    }
    getAutoCutGroup(lastCut, null, maxHeight).forEach((point) => {
        points.push(point + lastCut)
    })
    return points
}

function done () {
    duringScreenshot.value = false
    if (duringPartialScreenshot.value) {
        duringPartialScreenshot.value = false
    }
    title.value = ''
    emit('done')
}

const longScreenshot = computed(() => {
    return chats.value.length > 200
})

function _screenshot (ensure = false, watermarkCanvas = null) {
    const group = getScreenshotGroup()
    const options = {
        watermarkCanvas,
        title: title.value && parseFilename(title.value) ? parseFilename(title.value) : Date.now()
    }
    if (group.length > 0) {
        if (group.length > 10 && !ensure) {
            message.confirm(t.value.notify.screenshotExceeds10, t.value.noun.hint, () => {
                _screenshot(true, watermarkCanvas)
            }, () => {
                done()
            })
            return
        }
        const chatsData = copy(chats.value)
        const next = (i) => {
            if (i > group.length) {
                longScreenshot.value && message.notify(t.value.notify.screenshottedCompletely, message.success)
                done()
                screenshotNode.style.height = null
                setTimeout(() => {
                    chats.value = chatsData
                    setTimeout(() => {
                        longScreenshot.value ? message.notify(t.value.notify.recoveredSuccessfully, message.success) : message.notify(t.value.notify.multiScreenshotEnd, message.success)
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
                        ...options,
                        title: options.title + '-' + (i + 1)
                    })
                }, 100)
            }, 100)
        }
        longScreenshot.value ? message.notify(t.value.notify.startToScreenshot, message.warning) : message.notify(t.value.notify.multiScreenshotStart, message.warning)
        setTimeout(() => {
            next(0)
        }, 500)
    } else {
        // 将height定为整数，防止截图下方出现白条
        screenshotNode.style.height = screenshotNode.scrollHeight - 30 + 'px'
        setTimeout(() => {
            downloadScreenshot(() => {
                screenshotNode.style.height = null
                done()
            }, options)
        }, 100)
    }
}

function getWatermarkCanvas (cb) {
    getCanvas(watermarkNode, {
        windowWidth: rendererWidth.value.window + 20,
        scale: realScale.value,
        useCORS: true
    }, cb)
}

function screenshot () {
    duringScreenshot.value = true
    emit('start')
    cutPointViewMode.value = false
    nextTick(() => {
        if (commonSettings.value.watermark) {
            getWatermarkCanvas((canvas) => {
                _screenshot(false, canvas)
            })
        } else {
            _screenshot(false)
        }
    })
}

const expectCutNumber = computed(() => {
    const heights = []
    if (commonSettings.value.manualCut && sortedCutPoints.value.length && !duringPartialScreenshot.value) {
        const parts = []
        for (let i = 0; i < sortedCutPoints.value.length; i++) {
            const el = getDialogue(sortedCutPoints.value[i].id)
            if (!el) {
                // 多截图导致realMaxHeight变动，而此时部分dialogue被移出，无法获取
                // 返回最后可用值
                // TODO 获取是否正在截图 / 优化截图流程
                return expectCutNumber.value
            }
            parts.push(dialogueOffsetTop(el) + el.offsetHeight)
        }
        heights.push(parts[0])
        for (let i = 1; i < parts.length; i++) {
            heights.push(parts[i] - parts[i - 1] - 10)
        }
        const remainHeight = screenshotNode.scrollHeight - parts[parts.length - 1] - 40
        if (remainHeight > 0) {
            heights.push(remainHeight)
        }
    } else {
        heights.push(screenshotNode.scrollHeight - 30)
    }
    if (commonSettings.value.autoCut) {
        let cutNumber = 0
        for (let i = 0; i < heights.length; i++) {
            cutNumber += Math.ceil(heights[i] / realMaxHeight.value)
        }
        if (cutNumber > chats.value.length) {
            return chats.value.length
        } else {
            return cutNumber
        }
    } else {
        return heights.length
    }
})

const ExpectLength = {
    calc () {
        this.result.value = Math.ceil((screenshotNode.scrollHeight +
                (30 * (expectCutNumber.value - 1)) +
                (commonSettings.value.watermark ? (watermarkNode.scrollHeight - 1) * expectCutNumber.value : 0)) *
            realScale.value)
    },
    mount () {
        onUnmounted(DataControl.hook.change.on(() => {
            nextTick(
                () => {
                    this.calc()
                }
            )
        }))
        watch(
            () => {
                return [
                    commonSettings.value.autoCut,
                    commonSettings.value.manualCut,
                    commonSettings.value.watermark,
                    commonSettings.value.maxHeight
                ]
            },
            () => {
                this.calc()
            }
        )
        watch(duringPartialScreenshot, () => {
            nextTick(() => {
                this.calc()
            })
        })
    },
    result: ref(0)
}
ExpectLength.mount()

const wordCount = computed(() => {
    let count = 0
    for (let i = 0; i < chats.value.length; i++) {
        const chat = chats.value[i]
        const type = TypeSeries[chat.type]
        if (type === 'Text') {
            count += chat.content.length
        } else if (type === 'TextArray') {
            for (let j = 0; j < chat.content.length; j++) {
                count += chat.content[j][1].length
            }
        }
    }
    return count
})

function handleClose () {
    if (!duringScreenshot.value && duringPartialScreenshot.value) {
        duringPartialScreenshot.value = false
    }
    DataControl.save(['settings'])
}

defineExpose({
    screenshot
})
</script>

<template>
    <el-dialog v-model="mainShow.screenshotHelper.value" :width="dialogWidth" :title="t.noun.screenshot"
               @close="handleClose">
        <div>
            <div class="bar">
                <div style="display: flex; align-items: center; width: 100%">
                    <div class="line-left" style="width: 20px;"></div>
                    <h2 style="margin: 0 10px 0 0">{{ t.noun.watermark }}</h2>
                    <el-switch :model-value="commonSettings.watermark"
                               @update:model-value="(v) => setCommonSettings('watermark',v,(v) => !v)"></el-switch>
                    <div class="line-right"></div>
                </div>
            </div>
            <CollapseItem>
                <div v-show="commonSettings.watermark" style="padding: 0 0 10px 10px">
                    <table>
                        <tbody>
                        <tr>
                            <th>{{ t.noun.title }}</th>
                            <td>
                                <el-input v-model="title" clearable></el-input>
                            </td>
                        </tr>
                        <tr>
                            <th>{{ t.noun.author }}</th>
                            <td>
                                <el-input :model-value="settings.common.author" clearable
                                          @update:model-value="(v) => setCommonSettings('author',v)"></el-input>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </CollapseItem>
            <template v-if="!duringPartialScreenshot">
                <div class="bar">
                    <div style="display: flex; align-items: center; width: 100%">
                        <div class="line-left" style="width: 20px;"></div>
                        <h2 style="margin: 0 10px 0 0">{{ t.noun.manualCutting }}</h2>
                        <el-switch :model-value="commonSettings.manualCut"
                                   @update:model-value="(v) => setCommonSettings('manualCut',v,(v) => !v)"></el-switch>
                        <div class="line-right"></div>
                    </div>
                </div>
                <CollapseItem>
                    <div v-show="commonSettings.manualCut" style="padding: 0 0 10px 10px">
                        <div class="column-display"
                             style="display: flex; align-items: center; padding-top: 5px">
                            <div style="width: 100%">
                                {{ t.noun.numberOfCuttingPoints }}：{{ sortedCutPoints.length }}
                            </div>
                            <div style="width: 100%">
                                <el-button @click="enableCutPointView">{{ t.action.viewCuttingPoint }}</el-button>
                            </div>
                        </div>
                    </div>
                </CollapseItem>
            </template>
            <div class="bar">
                <div style="display: flex; align-items: center; width: 100%">
                    <div class="line-left" style="width: 20px;"></div>
                    <h2 style="margin: 0 10px 0 0">{{ t.noun.autoCut }}</h2>
                    <el-switch :model-value="commonSettings.autoCut"
                               @update:model-value="(v) => setCommonSettings('autoCut',v,(v) => !v)"></el-switch>
                    <div class="line-right"></div>
                </div>
            </div>
            <CollapseItem>
                <div v-show="commonSettings.autoCut" style="padding: 0 0 10px 10px">
                    <div class="column-display"
                         style="display: flex; align-items: center; padding-top: 5px">
                        <div style="width: 100%"> {{ t.noun.maxLength }}
                            <el-input
                                :model-value="settings.common.maxHeight" clearable
                                @update:model-value="(v) => setCommonSettings('maxHeight',+v,(v) => v > 0)"
                                style="width: 100px; margin-left: 10px"
                                :placeholder="''+defaultSettings.maxHeight"
                            />
                        </div>
                        <div style="width: 100%">
                            {{ t.noun.expectCutNumber }}: {{ expectCutNumber }}
                        </div>
                    </div>
                </div>
            </CollapseItem>
            <div class="bar">
                <div style="display: flex; align-items: center; width: 100%">
                    <div class="line-left" style="width: 20px;"></div>
                    <h2 style="margin: 0 10px 0 0">{{ t.noun.stats }}</h2>
                    <div class="line-right"></div>
                </div>
            </div>
            <div class="column-display" style="padding: 0 20px">
                <div style="width: 100%">
                    <table>
                        <tbody>
                            <tr>
                                <th>{{ t.noun.characterCount }}:</th>
                                <td>{{ Object.keys(chars).length }}</td>
                            </tr>
                            <tr>
                                <th>{{ t.noun.chatCount }}:</th>
                                <td>{{ chats.length }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div style="width: 100%">
                    <table>
                        <tbody>
                            <tr>
                                <th>{{ t.noun.wordCount }}:</th>
                                <td>{{ wordCount }}</td>
                            </tr>
                            <tr>
                                <th>{{ t.noun.screenshotLength }}:</th>
                                <td>{{ ExpectLength.result }}px</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div style="margin-top: 20px; display: flex; justify-content: flex-end">
            <el-button
                @click="() => {DataControl.save(['settings']); enablePartialScreenshotView()}"
                :disabled="duringPartialScreenshot"
                style="width: 30%"
            >{{ t.action.partialScreenshot }}
            </el-button>
            <el-button
                @click="() => {DataControl.save(['settings']); screenshot(); mainShow.screenshotHelper.value=false}"
                style="width: 30%"
            >{{ t.action.generate }}
            </el-button>
        </div>

    </el-dialog>
    <Teleport to="body">
        <div style="position: absolute; top: 0;z-index: -1; overflow: hidden"
             :style="{width: rendererWidth.window+'px'}">
            <div id="watermark" style="position: absolute; top: 0; background: white">
                <div :style="{width: rendererWidth.window+'px', background: rendererSettings.background}"
                     class="watermark-bar">
                    <h1 style="display: inline; flex-grow: 1; margin: 5px 5px 6px 0; opacity: 1"><i>MayerTalk</i></h1>
                    <div>
                        <p v-if="title" style="margin-bottom: 3px">{{ t.noun.title }}: {{ title }}</p>
                        <p v-if="commonSettings.author">{{ t.noun.author }}: {{ commonSettings.author }}</p>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.bar {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.line-left {
    margin-right: 10px;
    height: 0;
    border-top: lightgrey solid 1px;
}

.line-right {
    margin-left: 10px;
    flex-grow: 1;
    height: 0;
    border-top: lightgrey solid 1px;
}

.bar h2 {
    display: inline;
    margin: 0 10px 0 0;
}

table {
    border-spacing: 5px;
}

.watermark-bar {
    opacity: 0.5;
    display: flex;
    align-items: center;
    color: white;
    padding: 5px 10px;
    font-size: 16px;
}

.watermark-bar p {
    margin: 0;
}
</style>
