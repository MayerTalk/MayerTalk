<script setup>
import { ref, computed, watch, provide, nextTick, onMounted, onUnmounted } from 'vue'
import { t } from '@/lib/lang/translate'
import Renderers from '@/renderer'
import SideBar from './components/SideBar.vue'
import Settings from './components/SettingsDialog.vue'
import Savefile from './components/SavefileDialog.vue'
import EditCharDialog from './components/EditCharDialog.vue'
import EditDialogueDialog from './components/EditDialogueDialog.vue'
import AtDialog from './components/AtDialog.vue'
import CopyDialog from './components/CopyDialog.vue'
import CreateOptionDialog from './components/CreateOptionDialog.vue'
import NavigationBar from './components/NavigationBar.vue'
import ScreenshotHelper from '@/components/ScreenshotHelper.vue'
import PermanentSelectChar from '@/editor/Default/components/PermanentSelectChar.vue'
import WindowResize from '@/lib/utils/windowResize'
import { mobileView } from '@/editor/Default/lib/width'
import { cutPointViewMode, cutPointFocusHook, cutPointQuickEditMode } from '@/components/ManualCutPoint/control'
import { currRendererRef } from '@/lib/data/stats'
import { defaultShow } from '@/editor/Default/lib/showControl'

import {
    clickBySelector,
    getDialogue,
    Textarea
} from '@/lib/utils/tool'
import {
    chats,
    chars,
    config,
    avatars,
    currCharId,
    DataControl
} from '@/lib/data/data'
import { syncedSettings } from '@/lib/data/settings'
import {
    textarea,
    createTextDialogue,
    createImageDialogue,
    copyDialogue,
    deleteDialogue,
    DialogueHook
} from '@/lib/function/dialogue'
import message from '@/lib/utils/message'
import tipControl from '@/lib/function/tip'
import { windowWidth } from '@/lib/data/width'
import Input from '@/lib/function/input'
import ManualCutPointView from '@/components/ManualCutPoint/ManualCutPointView.vue'
import CollapseItem from '@/components/CollapseItem/CollapseItem.vue'
import { mainShow } from '@/lib/data/showControl'

const EditCharRef = ref(null)
const EditDialogueRef = ref(null)
const AtRef = ref(null)
const CreateOption = ref(null)
const NavigationBarRef = ref(null)

const controller = new AbortController()
document.addEventListener('keydown', event => {
    if (event.ctrlKey) {
        if (event.code === 'KeyC') {
            if (['TEXTAREA', 'INPUT'].indexOf(event.target.nodeName) === -1 || event.altKey) {
                event.preventDefault()
                EditCharRef.value.open(true)
            }
        } else if (event.code.indexOf('Digit') === 0 || event.code.indexOf('Numpad') === 0) {
            event.preventDefault()
            const index = (+event.key || 10) - 1
            const list = Object.entries(chars.value)
            if (index < list.length) {
                DataControl.curr.setChar(list[index][0])
            } else {
                EditCharRef.value.open(true)
            }
        } else if (event.code === 'KeyE') {
            event.preventDefault()
            if (!currCharId.value) {
                message.notify(t.value.notify.pleaseSelectCharacter, message.warning)
                return
            }
            EditCharRef.value.open(false)
        }
    }
}, { signal: controller.signal })
onUnmounted(() => {
    controller.abort()
})

const rendererWidth = ref({})
provide('rendererWidth', rendererWidth)

const charDirection = computed(() => {
    const dict = chars.value
    let left = false
    let right = false
    for (const char in dict) {
        if (Object.prototype.hasOwnProperty.call(dict, char)) {
            if (dict[char].right) {
                right = true
            } else {
                left = true
            }
        }
    }
    return [left, right]
})
provide('charDirection', charDirection)

const ResizeWindow = {
    time: 0,
    get (size) {
        return (this.time === 1 ? size : Math.ceil(this.time * size)) + 'px'
    },
    size: {
        avatar: 60,
        fontsize: 16
    },
    resize () {
        const max = syncedSettings.value.width + (charDirection.value[0] && charDirection.value[1] ? 120 : 60)
        if (preScreenshot.value) {
            rendererWidth.value.window = max
            rendererWidth.value.image = syncedSettings.value.width - (charDirection.value[0] && charDirection.value[1] ? 20 : 10) - 16 + 'px'
            this.time = 1
        } else {
            const w = Math.min(max, window.innerWidth)
            rendererWidth.value.window = w
            if (w === max) {
                this.time = 1
            } else {
                this.time = w / max
            }
        }
        for (const key in this.size) {
            if (Object.prototype.hasOwnProperty.call(this.size, key)) {
                rendererWidth.value[key] = this.get(this.size[key])
            }
        }
    }
}

onMounted(() => {
    ResizeWindow.resize()
})
watch(charDirection, () => {
    ResizeWindow.resize()
})
watch(() => {
    return syncedSettings.value.width
}, () => {
    ResizeWindow.resize()
})

function resizeBody (offset = 0) {
    const el = document.getElementById('body')
    el.style.height = window.innerHeight - offset + 'px'
    nextTick(() => {
        if (el.scrollWidth < window.innerWidth && offset < 5) {
            resizeBody(offset + 1)
        }
    })
}

onMounted(() => {
    resizeBody()
})

const scroll = ref()
const preScreenshot = ref(false)
const ifShowMoreType = ref(false)
const arrowStyle = ref({})
provide('scroll', scroll)
provide('preScreenshot', preScreenshot)

function roll360 () {
    if (ifShowMoreType.value) {
        arrowStyle.value = {
            transform: 'rotate(180deg)',
            transition: 'transform ease 0.4s'
        }
        resizeScroll(-100)
    } else {
        arrowStyle.value = {
            transform: 'rotate(360deg)',
            transition: 'transform ease 0.4s'
        }
        setTimeout(() => {
            arrowStyle.value = {}
        }, 500)
        resizeScroll(100)
    }
}

function resizeScroll (offset = 0) {
    const el = document.getElementById('textarea')
    if (el) {
        el.style.height = '20px'
        const height = el.scrollHeight > 20 ? el.scrollHeight : 20
        el.style.height = height + 'px'
    }
    const bar = document.getElementById('operate-bar')
    scrollHeight.value = bar.offsetTop + offset + 'px'
}

watch(textarea, () => {
    resizeScroll()
})
onUnmounted(WindowResize.onResize(() => {
    resizeScroll()
    resizeBody()
}))
onMounted(resizeScroll)
tipControl.hook = () => {
    nextTick(() => {
        resizeScroll()
    })
}

onUnmounted(DialogueHook.create.on((params) => {
    nextTick(() => {
        resizeScroll()
        if (!Object.prototype.hasOwnProperty.call(params.config, 'locate') || params.config.locate) {
            const el = getDialogue(params.data.id)
            scroll.value.setScrollTop(el.offsetTop)
        }
    })
}))

onUnmounted(DialogueHook.copy.on((params) => {
    nextTick(() => {
        resizeScroll()
        if (Object.prototype.hasOwnProperty.call(params.config, 'locate') ? params.config.locate : true) {
            const el = getDialogue(params.data.id)
            scroll.value.setScrollTop(el.offsetTop)
        }
    })
}))

const scrollHeight = ref(window.innerHeight - 90 + 'px')

const ScreenshotStateControl = {
    start () {
        preScreenshot.value = true
        ResizeWindow.resize()
    },
    done () {
        preScreenshot.value = false
        setTimeout(() => {
            ResizeWindow.resize()
        })
    }
}

const currScrollTop = ref(0)

onUnmounted(Input.hook.on((params) => {
    const scrollValue = currScrollTop.value
    if (document.activeElement === Textarea.el) {
        setTimeout(() => {
            scroll.value.setScrollTop(scrollValue + params.diff)
        }, 0)
    }
}))

watch(cutPointViewMode, () => {
    // setTimeout(() => {
    //     resizeScroll()
    // }, 500)
    nextTick(() => {
        resizeScroll()
    })
    if (cutPointViewMode.value === false) {
        setTimeout(() => {
            mainShow.screenshotHelper.value = true
        }, 250)
    }
})

onUnmounted(cutPointFocusHook.on((id) => {
    scroll.value.setScrollTop(getDialogue(id).offsetTop - window.innerHeight / 2 + getDialogue(id).offsetHeight)
}))

function clearViewport () {
    if (mobileView.value) {
        defaultShow.sidebar.value = false
    }
}

function handleEditDialogue (index) {
    if (cutPointViewMode.value && cutPointQuickEditMode.value) {
        const data = chats.value[index].data
        if (Object.prototype.hasOwnProperty.call(data, 'cutPoint') && data.cutPoint) {
            delete data.cutPoint
        } else {
            data.cutPoint = true
        }
        DialogueHook.update.call({
            data: chats.value[index],
            index
        })
        DataControl.save('chats')
    } else {
        EditDialogueRef.value.open(index)
    }
}

defineExpose({
    scroll,
    currScrollTop,
    clearViewport
})
</script>

<template>
    <!--Editor components start-->
    <ScreenshotHelper
        @start="ScreenshotStateControl.start"
        @done="ScreenshotStateControl.done"
    />
    <NavigationBar ref="NavigationBarRef"/>
    <Settings @resizeWindow="() => {ResizeWindow.resize()}"/>
    <Savefile/>
    <EditCharDialog ref="EditCharRef"/>
    <EditDialogueDialog ref="EditDialogueRef" @showCopy="defaultShow.copy.value=true"/>
    <AtDialog ref="AtRef"/>
    <CreateOptionDialog ref="CreateOption"/>
    <CopyDialog @coped="() => {EditDialogueRef.close()}"/>
    <!--Editor components end-->
    <div id="body" :style="{background: syncedSettings.background}">
        <PermanentSelectChar @select="args => EditCharRef.open(true,args)"/>
        <div style="flex-grow: 1; width: 100%; transition: all ease 0.6s;position: relative">
            <el-scrollbar :height="scrollHeight" ref="scroll" @scroll="(v) => {currScrollTop=v.scrollTop}">
                <div class="body" id="renderer-body">
                    <component :is="Renderers[config.renderer]" ref="currRendererRef"
                               @edit="handleEditDialogue"
                               @delete="deleteDialogue"
                               @plus1="copyDialogue"/>
                </div>
            </el-scrollbar>
            <div style="display: flex; justify-content: center">
                <div id="operate-bar" class="operate-bar" :style="{width: windowWidth + 'px'}">
                    <CollapseItem mode="">
                        <ManualCutPointView v-if="cutPointViewMode"/>
                        <div v-else style="display: flex; flex-wrap: wrap;align-items: flex-end">
                            <div class="button-bar">
                                <el-icon color="#707070" :size="35"
                                         style="margin-right: 5px; position: relative" :style="arrowStyle"
                                         @click="ifShowMoreType = !ifShowMoreType; roll360(); Textarea.focus()">
                                    <IconArrowUp/>
                                </el-icon>
                                <el-icon @click="createTextDialogue('monologue')" color="#707070" :size="35">
                                    <IconChatDotSquare/>
                                </el-icon>
                            </div>
                            <textarea class="textarea" id="textarea" v-model="textarea"
                                      :placeholder="tipControl.tip.value"
                                      @keydown.ctrl.enter="createTextDialogue('chat')"
                                      @input="AtRef.processInput"></textarea>
                            <div class="button-bar">
                                <el-icon @click="createTextDialogue('chat')" color="#808080" :size="35">
                                    <IconPromotion/>
                                </el-icon>
                            </div>
                            <div class="moretype-bar" :class="{show: ifShowMoreType}">
                                <div class="block" @click="clickBySelector('#uploadImage > div > input')">
                                    <el-upload id="uploadImage"
                                               action="#"
                                               :show-file-list="false"
                                               class="avatar-uploader"
                                               accept="image/png, image/jpeg, image/gif"
                                               :before-upload="createImageDialogue"
                                               style="position: absolute; width: 0; height: 0"
                                    ></el-upload>
                                    <el-icon color="#707070" :size="35">
                                        <IconPicture/>
                                    </el-icon>
                                    {{ t.name.typeDict.image }}
                                </div>
                                <div class="block" @click="CreateOption.open">
                                    <el-icon color="#707070" :size="35">
                                        <IconOperation/>
                                    </el-icon>
                                    {{ t.name.typeDict.option }}
                                </div>
                                <div class="block" @click="createTextDialogue('select')">
                                    <el-icon color="#707070" :size="35">
                                        <IconEdit/>
                                    </el-icon>
                                    {{ t.name.typeDict.select }}
                                </div>
                                <div class="block" @click="createTextDialogue('title')">
                                    <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"
                                         data-v-029747aa="" style="width: 35px; height: 35px">
                                        <path
                                            d="m199.04 672.64 193.984 112 224-387.968-193.92-112-224 388.032zm-23.872 60.16 32.896 148.288 144.896-45.696L175.168 732.8zM455.04 229.248l193.92 112 56.704-98.112-193.984-112-56.64 98.112zM104.32 708.8l384-665.024 304.768 175.936L409.152 884.8h.064l-248.448 78.336L104.32 708.8zm384 254.272v-64h448v64h-448z"
                                            fill="#707070"></path>
                                    </svg>
                                    {{ t.name.typeDict.title }}
                                </div>
                            </div>
                            <div class="char-bar">
                                <el-scrollbar :max-height="120" style="width: calc(100% - 55px)">
                                    <div class="container">
                                        <div v-for="(char, id) in chars" :key="id"
                                             :class="[id === currCharId?'char-curr':'char']"
                                             @click="DataControl.curr.setChar(id)">
                                            <img :src="avatars[id]">
                                        </div>
                                        <div class="option add"
                                             @click="EditCharRef.open(true)">
                                            <svg class="roll" viewBox="0 0 1024 1024"
                                                 xmlns="http://www.w3.org/2000/svg"
                                                 data-v-029747aa="" style="background: #707070">
                                                <path fill="#858585"
                                                      d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zm-38.4 409.6H326.4a38.4 38.4 0 1 0 0 76.8h147.2v147.2a38.4 38.4 0 0 0 76.8 0V550.4h147.2a38.4 38.4 0 0 0 0-76.8H550.4V326.4a38.4 38.4 0 1 0-76.8 0v147.2z"></path>
                                            </svg>
                                        </div>
                                    </div>
                                </el-scrollbar>
                                <div style="display: flex; align-items: center; justify-content: center;">
                                    <div class="option edit" style="height: 80%">
                                        <div v-if="currCharId" style="width: 40px; height: 40px"
                                             @click="EditCharRef.open(false)">
                                            <svg class="roll" viewBox="0 0 1024 1024"
                                                 xmlns="http://www.w3.org/2000/svg"
                                                 data-v-029747aa="">
                                                <path fill="#606060"
                                                      d="M600.704 64a32 32 0 0 1 30.464 22.208l35.2 109.376c14.784 7.232 28.928 15.36 42.432 24.512l112.384-24.192a32 32 0 0 1 34.432 15.36L944.32 364.8a32 32 0 0 1-4.032 37.504l-77.12 85.12a357.12 357.12 0 0 1 0 49.024l77.12 85.248a32 32 0 0 1 4.032 37.504l-88.704 153.6a32 32 0 0 1-34.432 15.296L708.8 803.904c-13.44 9.088-27.648 17.28-42.368 24.512l-35.264 109.376A32 32 0 0 1 600.704 960H423.296a32 32 0 0 1-30.464-22.208L357.696 828.48a351.616 351.616 0 0 1-42.56-24.64l-112.32 24.256a32 32 0 0 1-34.432-15.36L79.68 659.2a32 32 0 0 1 4.032-37.504l77.12-85.248a357.12 357.12 0 0 1 0-48.896l-77.12-85.248A32 32 0 0 1 79.68 364.8l88.704-153.6a32 32 0 0 1 34.432-15.296l112.32 24.256c13.568-9.152 27.776-17.408 42.56-24.64l35.2-109.312A32 32 0 0 1 423.232 64H600.64zm-23.424 64H446.72l-36.352 113.088-24.512 11.968a294.113 294.113 0 0 0-34.816 20.096l-22.656 15.36-116.224-25.088-65.28 113.152 79.68 88.192-1.92 27.136a293.12 293.12 0 0 0 0 40.192l1.92 27.136-79.808 88.192 65.344 113.152 116.224-25.024 22.656 15.296a294.113 294.113 0 0 0 34.816 20.096l24.512 11.968L446.72 896h130.688l36.48-113.152 24.448-11.904a288.282 288.282 0 0 0 34.752-20.096l22.592-15.296 116.288 25.024 65.28-113.152-79.744-88.192 1.92-27.136a293.12 293.12 0 0 0 0-40.256l-1.92-27.136 79.808-88.128-65.344-113.152-116.288 24.96-22.592-15.232a287.616 287.616 0 0 0-34.752-20.096l-24.448-11.904L577.344 128zM512 320a192 192 0 1 1 0 384 192 192 0 0 1 0-384zm0 64a128 128 0 1 0 0 256 128 128 0 0 0 0-256z"></path>
                                            </svg>
                                        </div>
                                        <div v-else class="scale"
                                             @click="defaultShow.sidebar.value=!defaultShow.sidebar.value">
                                            <svg xmlns="http://www.w3.org/2000/svg"
                                                 viewBox="0 0 16 16" focusable="false"
                                                 style="stroke: #606060">
                                                <path
                                                    d="M14 3.5H2v1h12v-1zM14 7.5H2v1h12v-1zM14 11.5H2v1h12v-1z"></path>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CollapseItem>
                </div>
            </div>
        </div>
        <SideBar @showNavigation="() => {NavigationBarRef.open()}"/>
    </div>
</template>

<style src="./style/global.css"/>
<style src="./style/avatar-uploader.css"/>

<style src="./style/editor.css" scoped/>
<style src="./style/operate-bar.css" scoped/>
<style src="./style/animation.css" scoped/>
