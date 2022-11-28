<script setup>
    import {inject, computed, watch, onMounted, nextTick} from 'vue';

    const chars = inject('chars');
    const config = inject('config');
    const {data, index} = defineProps(['data', 'index']);
    defineEmits(['edit']);
    const char = computed(() => {
        return chars.value[data.char] || {};
    });

    const right = computed(() => {
        if (data.char) {
            // opposite is deprecated
            // return data.opposite ? !char.value.right : !!char.value.right
            return !!char.value.right
        } else {
            return null
        }
    });

    function resize(t) {
        // 当height为小数时，html2canvas 会有1px的误差，在此赋值为整数
        if (data.type === 'image') {
            const el = document.getElementById(data.id);
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

    watch(data, () => {
        nextTick(resize)
    });
    onMounted(() => {
        resize()
    })
</script>

<template>
    <div :class="config.style">
        <div class="dialogue">
            <div style="display: flex; width: 100%; margin-bottom: 10px">
                <div class="avatar" @click="$emit('edit', index)">
                    <div v-if="right === false">
                        <img src="/avatar-bg.png">
                        <img :src="char.avatar">
                    </div>
                </div>
                <div v-if="data.type==='image'" class="image-box">
                    <div v-if="data.char" :class="[right? 'right':'left']">
                        <div class="tail">
                            <div class="tail2"></div>
                        </div>
                    </div>
                    <img :id="data.id" :src="data.content">
                </div>
                <template v-if="data.type==='chat'">
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
                <div class="avatar" @click="$emit('edit', index)">
                    <div v-if="right === true">
                        <img src="/avatar-bg.png">
                        <img :src="char.avatar">
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style src=".global.css"></style>
<style src=".scoped.css" scoped></style>