<script setup>
import { computed, inject, nextTick } from 'vue'
import { getCanvas, downloadCanvas, copy, getDialogue } from '@/lib/tool'
import { dialogWidth, TypeSeries } from '@/lib/constance'
import message from '@/lib/message'
import { t } from '@/lib/lang/translate'
import { chats, chars, settings, DataControl } from '@/lib/data'
import { defaultSettings, syncedSettings } from '@/lib/settings'
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
const rendererWidth = inject('rendererWidth')

function downloadScreenshot (cb = null, options = {}) {
    getCanvas(options.screenshotNode || screenshotNode, {
        windowWidth: rendererWidth.value.window + 20,
        scale: syncedSettings.value.scale,
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

const realMaxHeight = computed(() => {
    return syncedSettings.value.maxHeight / syncedSettings.value.scale - 30
})

function getScreenshotGroup () {
    // 30 上下margin (20+10)
    const totalHeight = (screenshotNode.scrollHeight - 30)
    // 缩小比例后实际 maxHeight
    let maxHeight = realMaxHeight.value
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
    if (group && syncedSettings.value.autoCut) {
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
               @closed="DataControl.save(['settings'])"
    >
        <div>
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
                                @input="(v) => {if(v){settings.maxHeight= +v}else{delete settings.maxHeight}}"
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
</style>
