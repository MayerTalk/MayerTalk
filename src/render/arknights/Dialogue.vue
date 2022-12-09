<script setup>
    import {ref, inject, computed, watch} from 'vue';
    import {uuid} from '@/lib/tool'
    import message from "../../lib/message";

    const chars = inject('chars');
    const images = inject('images');
    const renderSettings = inject('renderSettings');
    const width = inject('width');
    const charDirection = inject('charDirection');
    const preScreenshot = inject('preScreenshot');
    const plus1 = inject('plus1');
    const {data, index} = defineProps(['data', 'index']);
    defineEmits(['edit']);
    const char = computed(() => {
        return chars.value[data.char] || {};
    });
    const id = ref(uuid());

    const right = computed(() => {
        if (data.char) {
            // opposite is deprecated
            // return data.opposite ? !char.value.right : !!char.value.right
            return !!char.value.right
        } else {
            return null
        }
    });

    function resizeImage() {
        if (data.type === 'image') {
            id.value = uuid();
        }
    }

    function requestPlus1() {
        // Dialogue内触发+1请求交Render处理
        plus1.value = -1;
    }

    watch(() => width.value.window, () => {
        // window改变时调整图片大小
        resizeImage()
    });
    watch(charDirection, () => {
        // 头像列改变时调整图片大小
        resizeImage()
    });
</script>

<template>
    <div :class="renderSettings.style">
        <div class="dialogue">
            <div style="display: flex; width: 100%; margin-bottom: 10px;" @click="$emit('edit', index)">
                <div v-if="charDirection[0]" class="avatar" style="margin-right: 10px">
                    <div v-if="right === false">
                        <img src="/avatar-bg.png">
                        <img :src="images[char.avatar] || char.avatar">
                    </div>
                </div>
                <div v-if="data.type==='image'" class="image-box">
                    <div v-if="data.char" :class="[right? 'right':'left']">
                        <div class="tail">
                            <div class="tail2"></div>
                        </div>
                    </div>
                    <img :id="data.id" :key="id" :src="images[data.content]"
                         :style="{width: preScreenshot?width.image:'100%'}"
                    >
                </div>
                <template v-if="data.type==='chat'">
                    <div v-if="data.char" :class="[right? 'right':'left', 'avatar-id']">
                        {{chars[data.char].name || ""}}
                    </div>
                    <div v-if="data.char" class="dialogue-box">
                        <div :class="[right? 'right':'left']">
                            <div class="tail">
                                <div class="tail2"></div>
                            </div>
                        </div>
                        <pre style="font-family: Harmony">{{data.content}}</pre>
                    </div>
                    <div v-else style="color: #CCCCCC" class="narration-box">
                        <pre>{{data.content}}</pre>
                    </div>
                </template>
                <template v-if="data.type==='monologue'">
                    <div v-if="data.char" class="monologue-box">
                        <pre>{{data.content}}</pre>
                    </div>
                    <div v-else style="color: #909090" class="narration-box">
                        <pre>{{data.content}}</pre>
                    </div>
                </template>
                <div v-if="charDirection[1]" class="avatar" style="margin-left: 10px">
                    <div v-if="right === true">
                        <img src="/avatar-bg.png">
                        <img :src="images[char.avatar] || char.avatar">
                    </div>
                </div>
            </div>
        </div>
        <div v-if="plus1 === index" class="plus1" @click="requestPlus1" style="
            color: rgb(13,121,240);
            position: absolute;
            top: 50%;
            right: -3em;
            border: 2px solid rgb(13,121,240);
            background: white;
            border-radius: 1.8em;
            width: 1.6em;
            height: 1.6em;
            cursor: pointer;"
        >+1</div>
    </div>
</template>

<style src=".global.css"></style>
<style src=".scoped.css" scoped></style>
<style scoped>
    .avatar {
        width: v-bind('width.avatar');
        height: v-bind('width.avatar');
    }

    .dialogue pre {
        font-size: v-bind('width.fontsize');
    }
</style>