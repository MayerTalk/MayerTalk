<script setup>
import { computed, inject, nextTick, ref } from 'vue'
import { getCanvas, downloadCanvas, copy, getDialogue } from '@/lib/tool'
import { dialogWidth, TypeSeries } from '@/lib/constance'
import message from '@/lib/message'
import { t } from '@/lib/lang/translate'
import { chats, chars, settings, DataControl } from '@/lib/data'
import { defaultSettings, syncedSettings, setSettings } from '@/lib/settings'
import CollapseItem from '@/components/CollapseItem.vue'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue', 'start', 'done'])

const ifShowScreenshotHelper = computed({
    get () {
        return props.modelValue
    },
    set (value) {
        emit('update:modelValue', value)
    }
})
let screenshotNode = null
let watermarkNode = null
const rendererWidth = inject('rendererWidth')
const title = ref('')

function downloadScreenshot (cb = null, options = {}) {
    getCanvas(options.screenshotNode || screenshotNode, {
        windowWidth: rendererWidth.value.window + 20,
        scale: syncedSettings.value.scale,
        useCORS: true,
        ...(options.options || {})
    }, (canvas) => {
        if (options.watermarkCanvas) {
            const finalCanvas = document.createElement('canvas')
            const ctx = finalCanvas.getContext('2d')
            finalCanvas.width = canvas.width
            finalCanvas.height = options.watermarkCanvas.height + canvas.height
            ctx.drawImage(options.watermarkCanvas, 0, 0)
            ctx.drawImage(canvas, 0, options.watermarkCanvas.height)
            downloadCanvas(finalCanvas, cb, options.seq, options.filename)
        } else {
            downloadCanvas(canvas, cb, options.seq, options.filename)
        }
    })
}

function getNode () {
    if (document.getElementById('renderer') && document.getElementById('watermark')) {
        screenshotNode = document.getElementById('renderer')
        watermarkNode = document.getElementById('watermark')
    } else {
        setTimeout(() => {
            getNode()
        }, 10)
    }
}

const realMaxHeight = computed(() => {
    // -30 renderer上下padding (20+10)
    // -10 watermark上下padding (5+5)
    // +10 dialogue无效margin-bottom
    const res = Math.floor(syncedSettings.value.maxHeight / syncedSettings.value.scale) - 30 -
        (syncedSettings.value.watermark ? watermarkNode.scrollHeight + 10 : 0) + 10
    return res > 0 ? res : 1
})

function offsetTop (el) {
    // offsetTop 包含 renderer paddingTop 20px
    return el.offsetTop - 20
}

function getScreenshotGroup () {
    const totalHeight = screenshotNode.scrollHeight + (syncedSettings.value.watermark ? watermarkNode.scrollHeight : 0)
    // 缩小比例后实际 maxHeight
    const maxHeight = realMaxHeight.value
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
            if (offsetTop(dialogue) - croppedHeight > maxHeight) {
                if (i - 1 <= lastCrop) {
                    // 最小粒度 (1对话)
                    continue
                }
                points.push(i - 1)
                croppedHeight = offsetTop(getDialogue(chats.value[i - 1].id))
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
        if (offsetTop(dialogue) - croppedHeight > maxHeight) {
            // part1 过长
            if (totalHeight - offsetTop(dialogue) >= maxHeight) {
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

function _screenshot (ensure = false, watermarkCanvas = null) {
    const group = getScreenshotGroup()
    if (group && syncedSettings.value.autoCut) {
        if (group.length > 10 && !ensure) {
            message.confirm(t.value.notify.screenshotExceeds10, t.value.noun.hint, () => {
                _screenshot(true, watermarkCanvas)
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
                        seq: seq + (i + 1),
                        watermarkCanvas
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
                }, {
                    watermarkCanvas
                })
            }, 100)
        })
    }
}

function getWatermarkCanvas (cb) {
    getCanvas(watermarkNode, {
        windowWidth: rendererWidth.value.window + 20,
        scale: syncedSettings.value.scale,
        useCORS: true
    }, cb)
}

function screenshot () {
    emit('start')
    if (syncedSettings.value.watermark) {
        getWatermarkCanvas((canvas) => {
            _screenshot(false, canvas)
        })
    } else {
        _screenshot(false)
    }
}

getNode()

const expectCutNumber = computed(() => {
    return Math.ceil(screenshotNode.scrollHeight / realMaxHeight.value)
})

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

defineExpose({
    screenshot
})
</script>

<template>
    <el-dialog v-model="ifShowScreenshotHelper" :width="dialogWidth" :title="'截图'"
               @closed="DataControl.save(['settings'])">
        <div>
            <div class="bar">
                <div style="display: flex; align-items: center; width: 100%">
                    <div class="line-left" style="width: 20px;"></div>
                    <h2 style="margin: 0 10px 0 0">水印</h2>
                    <el-switch v-model="syncedSettings.watermark"
                               @change="(value) => {settings.watermark=value}"></el-switch>
                    <div class="line-right"></div>
                </div>
            </div>
            <CollapseItem>
                <div v-show="syncedSettings.watermark" style="transition: all ease-in-out .5s; padding: 0 0 10px 10px">
                    <table>
                        <tr>
                            <th>标题</th>
                            <td>
                                <el-input v-model="title" clearable></el-input>
                            </td>
                        </tr>
                        <tr>
                            <th>作者</th>
                            <td>
                                <el-input v-model="syncedSettings.author" clearable
                                          @input="(v) => {setSettings(v,'author')}"></el-input>
                            </td>
                        </tr>
                    </table>
                </div>
            </CollapseItem>
            <div class="bar">
                <div style="display: flex; align-items: center; width: 100%">
                    <div class="line-left" style="width: 20px;"></div>
                    <h2 style="margin: 0 10px 0 0">自动裁分</h2>
                    <el-switch v-model="syncedSettings.autoCut"
                               @change="(value) => {settings.autoCut=value}"></el-switch>
                    <div class="line-right"></div>
                </div>
            </div>
            <CollapseItem>
                <div v-show="syncedSettings.autoCut" style="transition: all ease-in-out .5s; padding: 0 0 10px 10px">
                    <div class="column-display"
                         style="display: flex; align-items: center; padding-top: 5px">
                        <div style="width: 100%"> 最大长度
                            <el-input
                                v-model="settings.maxHeight" clearable type="number"
                                style="width: 100px; margin-left: 10px"
                                :placeholder="''+defaultSettings.maxHeight"
                                @input="(v) => {setSettings(+v,'maxHeight')}"
                            />
                        </div>
                        <div style="width: 100%">
                            预计裁分: {{ expectCutNumber }}
                        </div>
                    </div>
                </div>
            </CollapseItem>
            <div class="bar">
                <div style="display: flex; align-items: center; width: 100%">
                    <div class="line-left" style="width: 20px;"></div>
                    <h2 style="margin: 0 10px 0 0">统计</h2>
                    <div class="line-right"></div>
                </div>
            </div>
            <div class="column-display" style="padding: 0 20px">
                <div style="width: 100%">
                    <table>
                        <tr>
                            <th>角色数:</th>
                            <td>{{ Object.keys(chars).length }}</td>
                        </tr>
                        <tr>
                            <th>对话数:</th>
                            <td>{{ chats.length }}</td>
                        </tr>
                    </table>
                </div>
                <div style="width: 100%">
                    <table>
                        <tr>
                            <th>文本量:</th>
                            <td>{{ wordCount }}</td>
                        </tr>
                        <tr>
                            <th>截图长度:</th>
                            <td>{{ (screenshotNode.scrollHeight + expectCutNumber * 30) * syncedSettings.scale }}px</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
        <div style="margin-top: 20px; display: flex; justify-content: flex-end">
            <el-button
                @click="() => {DataControl.save(['settings']); screenshot(); ifShowScreenshotHelper=false}"
                style="width: 30%"
            >生成
            </el-button>
        </div>

    </el-dialog>
    <Teleport to="body">
        <div id="watermark" style="position: absolute; top: 0; z-index: -1; background: white">
            <div :style="{width: rendererWidth.window+'px', background: syncedSettings.background}"
                 class="watermark-bar">
                <h1 style="display: inline; flex-grow: 1; margin: 5px 5px 5px 0; opacity: 1"><i>MayerTalk</i></h1>
                <div>
                    <p v-if="title" style="margin-bottom: 3px">标题: {{ title }}</p>
                    <p v-if="syncedSettings.author">作者: {{ syncedSettings.author }}</p>
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
