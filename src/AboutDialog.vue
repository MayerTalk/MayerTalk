<script setup>
import { computed } from 'vue'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

const ifShowAbout = computed({
    get () {
        return props.modelValue
    },
    set (value) {
        emit('update:modelValue', value)
    }
})

const dialogWidth = Math.ceil(Math.min(document.body.clientWidth, 700) * 0.9)

const contributors = [
    ['meeboo3', 'meeboo3', '118372959'],
    ['Lightyears', '1MLightyears', '31664721']
]
</script>

<template>
    <el-dialog v-model="ifShowAbout" title="关于" :width="dialogWidth">
        <h2 style="display: inline">MayerTalk(beta)</h2><br/>
        <p>明日方舟对话编辑器，以明日方舟「叙拉古人」活动对话为蓝本开发，目前仍处于beta阶段</p>
        <p style="display: flex; align-items: center">Github:
            <el-link href="https://github.com/Arkfans/MayerTalk" type="primary" style="margin-left: 5px"
                     target="_blank">
                Arkfans/MayerTalk
            </el-link>
        </p>
        <p style="display: flex; align-items: center">开发站点:
            <el-link href="https://dev.mayertalk.top/" type="primary" style="margin-left: 5px">
                dev.mayertalk.top
            </el-link>
        </p>
        <h3>贡献者</h3>
        <div class="contributors">
            <div v-for="user in contributors" :title="user[0]" class="avatar" :key="user[2]">
                <a :href="'https://github.com/'+user[1]" target="_blank">
                    <img :src="'https://avatars.githubusercontent.com/u/' + user[2] + '?v=4'" alt=""/>
                </a>
            </div>
        </div>
        <h3>声明</h3>
        网站内使用的游戏图片、文本原文，仅用于更好地表现游戏资料，其版权属于 Arknights/上海鹰角网络科技有限公司
    </el-dialog>
</template>

<style scoped>
    .contributors {
        display: flex;
        flex-wrap: wrap;
    }

    .avatar {
        width: 46px;
        height: 46px;
        border-radius: 50%;
        overflow: hidden;
        margin: 2px;
    }

    .avatar img {
        width: 100%;
        height: 100%;
    }
</style>
