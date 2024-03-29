<script setup>
import { ref, inject, computed, watch } from 'vue'
import { uuid } from '@/lib/utils/tool'
import { StaticUrl } from '@/lib/data/constance'
import {
    chars,
    images,
    avatars
} from '@/lib/data/data'
import { rendererSettings } from '@/lib/data/settings'
import { Suffix } from '@/lib/data/character'
import CutPointDialogueWrapper from '@/components/ManualCutPoint/CutPointDialogueWrapper.vue'
import { DialogueHook } from '@/lib/function/dialogue'
import { duringScreenshot, selectMode } from '@/lib/data/state'

const rendererWidth = inject('rendererWidth')
const charDirection = inject('charDirection')
const props = defineProps({
    data: {},
    index: {
        type: Number
    },
    plus1: {
        type: Boolean,
        default: false
    },
    cutPoint: {
        type: Boolean,
        default: false
    },
    cutPointActive: {
        type: Boolean,
        default: false
    },
    select: {
        type: Boolean,
        default: false
    }
})
const emit = defineEmits(['edit', 'delete', 'plus1'])

const data = computed(() => props.data)
const index = computed(() => props.index)

const char = computed(() => {
    return chars.value[data.value.char] || {}
})
const imageUpdateId = ref(uuid())
const right = computed(() => {
    if (data.value.char) {
        // opposite is deprecated
        // return data.opposite ? !char.value.right : !!char.value.right
        return !!char.value.right
    } else {
        return null
    }
})

function resizeImage () {
    if (data.value.type === 'image') {
        imageUpdateId.value = uuid()
    }
}

watch(() => rendererWidth.value.window, () => {
    // window改变时调整图片大小
    resizeImage()
})
watch(charDirection, () => {
    // 头像列改变时调整图片大小
    resizeImage()
})

function handleClick (event) {
    let next = true
    const eventData = {
        data: {
            id: data.value.id,
            index: index.value
        },
        raw: event,
        preventDefault () {
            next = false
        }
    }
    DialogueHook.click.call(eventData)
    if (next) {
        emit(event.ctrlKey ? 'delete' : 'edit', index.value)
    }
}
</script>

<template>
    <div class="dialogue" :id="data.id" :style="{opacity:selectMode?(select?'1':'0.3'):null}">
        <div style="display: flex; width: 100%; margin-bottom: 10px;"
             @click="handleClick"
             :style="{justifyContent:(right?'flex-end':'flex-start')}">
            <div v-if="data.type==='title'" style="flex-grow: 1">
                <div
                    v-if="rendererSettings.showCharName && data.char && rendererSettings.showCharNameSettings[data.type]"
                    class="charName">{{ char.name }}
                </div>
                <div class="title-box">
                    <div style="background: darkgrey; padding: 0 7px; font-size: 10px">DIALOGUE</div>
                    <div style="color: var(--dialogue-color); padding: 0 10px; position:relative;">
                        <div class="block" style="top: 0; left: 0"></div>
                        <div class="block" style="bottom: 0; left: 0"></div>
                        <div class="block" style="top: 0; right: 0"></div>
                        <div class="block" style="bottom: 0; right: 0"></div>
                        <pre>{{ data.content }}</pre>
                    </div>
                    <div class="line"></div>
                </div>
            </div>
            <template v-else>
                <div v-if="charDirection[0]" class="avatar" style="margin-right: 10px">
                    <div v-if="right === false">
                        <img :src="StaticUrl + 'avatar-bg' + Suffix">
                        <img :src="avatars[data.char]">
                    </div>
                </div>
                <!--Content Start-->
                <div :style="{'flex-grow':data.type==='image'?0:1}">
                    <div
                        v-if="rendererSettings.showCharName && data.char && rendererSettings.showCharNameSettings[data.type]"
                        class="charName">{{ char.name }}
                    </div>
                    <div v-if="data.type==='image'" class="box image-box" style="justify-self: flex-start">
                        <div v-if="data.char" :class="[right? 'right':'left']">
                            <div class="tail">
                                <div class="tail2"></div>
                            </div>
                        </div>
                        <img v-if="images[data.content]"
                             :id="data.id" :key="imageUpdateId" :src="images[data.content].src"
                             :style="{width: duringScreenshot?rendererWidth.image:'100%'}"
                        >
                        <span v-else>loading image...</span>
                    </div>
                    <template v-else-if="data.type==='chat'">
                        <div v-if="data.char" class="box dialogue-box">
                            <div :class="[right? 'right':'left']">
                                <div class="tail">
                                    <div class="tail2"></div>
                                </div>
                                <pre>{{ data.content }}</pre>
                            </div>
                        </div>
                        <div v-else style="color: #CCCCCC" class="box">
                            <pre>{{ data.content }}</pre>
                        </div>
                    </template>
                    <template v-else-if="data.type==='monologue'">
                        <div v-if="data.char" class="box monologue-box">
                            <pre>{{ data.content }}</pre>
                        </div>
                        <div v-else style="color: #909090" class="box">
                            <pre>{{ data.content }}</pre>
                        </div>
                    </template>
                    <template v-else-if="data.type==='option'">
                        <div class="option-box">
                            <div v-for="value in data.content" class="block" :key="value[0]">
                                <div class="bg">
                                    <div class="triangle" style="margin-left: 14px"></div>
                                    <div class="triangle"></div>
                                    <div class="triangle"></div>
                                </div>
                                <div class="text">
                                    <pre>{{ value[1] }}</pre>
                                </div>
                            </div>
                        </div>
                    </template>
                    <template v-else-if="data.type==='select'">
                        <div class="box select-box">
                            <div class="triangle-box">
                                <div class="triangle" style="margin-left: 14px"></div>
                                <div class="triangle"></div>
                                <div class="triangle"></div>
                            </div>
                            <div class="text">
                                <pre>{{ data.content }}</pre>
                            </div>
                            <div class="triangle-box" style="transform: rotate(180deg)">
                                <div class="triangle" style="margin-left: 14px"></div>
                                <div class="triangle"></div>
                                <div class="triangle"></div>
                            </div>
                        </div>
                    </template>
                </div>
                <!--Content End-->
                <div v-if="charDirection[1]" class="avatar" style="margin-left: 10px">
                    <div v-if="right === true">
                        <img :src="StaticUrl + '/avatar-bg' + Suffix">
                        <img :src="avatars[data.char]">
                    </div>
                </div>
            </template>
        </div>
        <div v-if="plus1 && !duringScreenshot" class="plus1" @click="$emit('plus1',index)">
            <p>+1</p>
        </div>
        <CutPointDialogueWrapper v-if="cutPoint" :active="cutPointActive"/>
    </div>
</template>
<style src="../style/dialogue.css" scoped/>
<style src="../style/plus1.css" scoped/>
<style scoped>
.avatar {
    width: v-bind('rendererWidth.avatar');
    height: v-bind('rendererWidth.avatar');
}

.dialogue pre {
    font-size: v-bind('rendererWidth.fontsize');
}

.charName {
    text-align: v-bind("right?'right':'left'");
}
</style>
