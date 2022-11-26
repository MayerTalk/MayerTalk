<script setup>
    import {inject, computed, watch, onMounted, nextTick} from 'vue';

    const characters = inject('characters');
    const {data, index} = defineProps(['data', 'index']);
    defineEmits(['edit']);
    const character = computed(() => {
        return characters.value[data.character] || {};
    });
    const id = Date.now() + '';

    const right = computed(() => {
        if (data.character) {
            return data.opposite ? !character.value.right : !!character.value.right
        } else {
            return null
        }
    });

    function resize(t) {
        // 当height为小数时，html2canvas 会有1px的误差，在此赋值为整数
        if (data.image) {
            const el = document.getElementById(id);
            if (el.offsetHeight === 0) {
                if (t > 10) {
                    return
                }
                if (!t) {
                    t = 1
                }
                setTimeout(resize, 5, t++)
            } else {
                el.style.height = el.offsetHeight + 'px'
            }
        }
    }

    watch(data, resize);
    onMounted(() => {
        resize()
    })
</script>

<template>
    <div style="display: flex; width: 100%; margin-bottom: 10px">
        <div class="avatar" @click="$emit('edit', index)">
            <div v-if="right === false">
                <img src="/avatar-bg.png">
                <img :src="character.avatar">
            </div>
        </div>
        <div v-if="data.image" class="image-box">
            <div v-if="data.character" :class="[right? 'right':'left']">
                <div class="tail">
                    <div class="tail2"></div>
                </div>
            </div>
            <img :id="id" :src="data.url">
        </div>
        <div v-else-if="!data.character" class="narration-box"
             :style="{color: data.thought?'#909090':'#CCCCCC'}">
            <pre>{{data.text}}</pre>
        </div>
        <div v-else-if="data.thought" class="thought-box">
            <pre>{{data.text}}</pre>
        </div>
        <div v-else class="dialogue-box">
            <div :class="[right? 'right':'left']">
                <div class="tail">
                    <div class="tail2"></div>
                </div>
            </div>
            <pre>{{data.text}}</pre>
        </div>
        <div class="avatar" @click="$emit('edit', index)">
            <div v-if="right === true">
                <img src="/avatar-bg.png">
                <img :src="character.avatar">
            </div>
        </div>
    </div>
</template>

<style>
    :root {
        --dialogue-border-color: #666666;
        --dialogue-background: #222222;
        --dialogue-color: #EEEEEE;
    }
</style>

<style scoped>
    pre {
        margin: 0;
        word-break: break-all;
        white-space: pre-wrap;
    }

    .avatar {
        position: relative;
        flex-shrink: 0;
        width: 55px;
        height: 55px;
    }

    .avatar img {
        position: absolute;
        width: 100%;
        height: 100%;
    }

    .thought-box {
        align-self: flex-start;
        flex-grow: 1;
        margin: 0 10px 0 10px;
        padding: 8px;
        font-size: 13px;
        background: #606060;
        color: white;
        opacity: 0.6;
    }

    .image-box {
        align-self: flex-start;
        margin: 0 10px 0 10px;
        position: relative;
        padding: 7px;
        background: var(--dialogue-background);
        border: var(--dialogue-border-color) solid 1px;
        color: var(--dialogue-color);
    }

    .image-box img {
        width: 100%;
        display: flex;
    }

    .narration-box {
        align-self: flex-start;
        flex-grow: 1;
        margin: 0 10px 0 10px;
        padding: 8px;
        font-size: 13px;
    }

    .dialogue-box {
        align-self: flex-start;
        flex-grow: 1;
        margin: 0 10px 0 10px;
        padding: 8px;
        font-size: 13px;
        position: relative;
        background: var(--dialogue-background);
        border: var(--dialogue-border-color) solid 1px;
        color: var(--dialogue-color);
    }

    .left .tail {
        position: absolute;
        width: 10px;
        height: 10px;
        left: -10px;
        transform: rotate(-2deg);
        border-bottom: var(--dialogue-border-color) solid 1px;
        overflow: hidden;
    }

    .left .tail2 {
        position: absolute;
        width: 13px;
        left: 1px;
        height: 10px;
        top: 6px;
        transform: rotate(-35deg);
        background: var(--dialogue-background);
        border-top: var(--dialogue-border-color) solid 1px;
    }

    .right .tail {
        position: absolute;
        width: 10px;
        height: 10px;
        left: 100%;
        top: 9px;
        transform: rotate(2deg);
        border-bottom: var(--dialogue-border-color) solid 1px;
        overflow: hidden;
    }

    .right .tail2 {
        position: absolute;
        width: 13px;
        left: -4px;
        height: 10px;
        top: 6px;
        transform: rotate(35deg);
        background: var(--dialogue-background);
        border-top: var(--dialogue-border-color) solid 1px;
    }
</style>