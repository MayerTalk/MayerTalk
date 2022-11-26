<script setup>
    import {inject, computed, watch, onMounted} from 'vue';

    const chars = inject('chars');
    const config = inject('config');
    const {data, index} = defineProps(['data', 'index']);
    defineEmits(['edit']);
    const char = computed(() => {
        return chars.value[data.char] || {};
    });
    const id = Date.now() + '';

    const right = computed(() => {
        if (data.char) {
            return data.opposite ? !char.value.right : !!char.value.right
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
    <div class="dialogue" :class="config.style">
        <div style="display: flex; width: 100%; margin-bottom: 10px">
            <div class="avatar" @click="$emit('edit', index)">
                <div v-if="right === false">
                    <img src="/avatar-bg.png">
                    <img :src="char.avatar">
                </div>
            </div>
            <div v-if="data.image" class="image-box">
                <div v-if="data.char" :class="[right? 'right':'left']">
                    <div class="tail">
                        <div class="tail2"></div>
                    </div>
                </div>
                <img :id="id" :src="data.url">
            </div>
            <div v-else-if="!data.char" class="narration-box"
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
                    <img :src="char.avatar">
                </div>
            </div>
        </div>
    </div>
</template>

<style src=".global.css"></style>
<style src=".scoped.css" scoped></style>