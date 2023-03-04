<script setup>
import { ref, inject, computed, watch } from 'vue'
import { uuid } from '@/lib/tool'
import { StaticUrl } from '@/lib/constance'
import {
    chars,
    images,
    avatars
} from '@/lib/data'

const renderSettings = inject('renderSettings')
const width = inject('width')
const charDirection = inject('charDirection')
const preScreenshot = inject('preScreenshot')
const props = defineProps(['data', 'index', 'plus1'])
defineEmits(['edit', 'plus1'])

const data = computed(() => props.data)
const index = computed(() => props.index)

const char = computed(() => {
    return chars.value[data.value.char] || {}
})
const id = ref(uuid())
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
        id.value = uuid()
    }
}

watch(() => width.value.window, () => {
    // window改变时调整图片大小
    resizeImage()
})
watch(charDirection, () => {
    // 头像列改变时调整图片大小
    resizeImage()
})
</script>

<template>
    <div :class="renderSettings.style" :id="data.id">
        <div class="dialogue">
            <div style="display: flex; width: 100%; margin-bottom: 10px;" @click="$emit('edit', index)"
                 :style="{justifyContent:(right?'flex-end':'flex-start')}">
                <div v-if="data.type==='title'" style="flex-grow: 1">
                    <div v-if="renderSettings.showCharName && data.char && renderSettings.showCharNameSettings[data.type]"
                         class="charName">{{char.name}}
                    </div>
                    <div class="title-box">
                        <div style="background: darkgrey; padding: 0 7px; font-size: 10px">DIALOGUE</div>
                        <div style="color: var(--dialogue-color); padding: 0 10px; position:relative;">
                            <div class="block" style="top: 0; left: 0"></div>
                            <div class="block" style="bottom: 0; left: 0"></div>
                            <div class="block" style="top: 0; right: 0"></div>
                            <div class="block" style="bottom: 0; right: 0"></div>
                            <pre>{{data.content}}</pre>
                        </div>
                        <div class="line"></div>
                    </div>
                </div>
                <template v-else>
                    <div v-if="charDirection[0]" class="avatar" style="margin-right: 10px">
                        <div v-if="right === false">
                            <img :src="StaticUrl + 'avatar-bg.webp'">
                            <img :src="avatars[data.char]">
                        </div>
                    </div>
                    <!--Content Start-->
                    <div :style="{'flex-grow':data.type==='image'?0:1}">
                        <div v-if="renderSettings.showCharName && data.char && renderSettings.showCharNameSettings[data.type]"
                             class="charName">{{char.name}}
                        </div>
                        <div v-if="data.type==='image'" class="box image-box" style="justify-self: flex-start">
                            <div v-if="data.char" :class="[right? 'right':'left']">
                                <div class="tail">
                                    <div class="tail2"></div>
                                </div>
                            </div>
                            <img v-if="images[data.content]"
                                 :id="data.id" :key="id" :src="images[data.content].src"
                                 :style="{width: preScreenshot?width.image:'100%'}"
                            >
                            <span v-else>loading image...</span>
                        </div>
                        <template v-else-if="data.type==='chat'">
                            <div v-if="data.char" class="box dialogue-box">
                                <div :class="[right? 'right':'left']">
                                    <div class="tail">
                                        <div class="tail2"></div>
                                    </div>
                                    <pre>{{data.content}}</pre>
                                </div>
                            </div>
                            <div v-else style="color: #CCCCCC" class="box">
                                <pre>{{data.content}}</pre>
                            </div>
                        </template>
                        <template v-else-if="data.type==='monologue'">
                            <div v-if="data.char" class="box monologue-box">
                                <pre>{{data.content}}</pre>
                            </div>
                            <div v-else style="color: #909090" class="box">
                                <pre>{{data.content}}</pre>
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
                                        <pre>{{value[1]}}</pre>
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
                                    <pre>{{data.content}}</pre>
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
                            <img :src="StaticUrl + '/avatar-bg.webp'">
                            <img :src="avatars[data.char]">
                        </div>
                    </div>
                </template>
            </div>
            <div v-if="props.plus1 && !preScreenshot" class="plus1" @click="$emit('plus1',index)">
                <p>+1</p>
            </div>
        </div>
    </div>
</template>
<style src="../style/dialogue.css" scoped/>
<style src="../style/plus1.css" scoped/>
<style scoped>
    .avatar {
        width: v-bind('width.avatar');
        height: v-bind('width.avatar');
    }

    .dialogue pre {
        font-size: v-bind('width.fontsize');
    }

    .charName {
        text-align: v-bind("right?'right':'left'");
    }
</style>
