<script setup>
import { computed, onMounted } from 'vue'
import { saveData, getData } from './lib/tool'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue', 'showGuide'])

const ifShowAnnouncement = computed({
    get () {
        return props.modelValue
    },
    set (value) {
        emit('update:modelValue', value)
    }
})

const version = 'v0.1.6'
const dialogWidth = Math.ceil(Math.min(window.innerWidth, 700) * 0.9)

onMounted(() => {
    if (getData('a_version') !== version) {
        emit('update:modelValue', true)
        saveData('a_version', version)
    } else if (invalidBrowser) {
        emit('update:modelValue', true)
    }
})

const invalidBrowser = navigator.userAgent.indexOf('UCBrowser') !== -1 ||
    navigator.userAgent.indexOf('Quark') !== -1 ||
    navigator.userAgent.indexOf('QQBrowser') !== -1 ||
    navigator.userAgent.indexOf('baidu') !== -1
</script>

<template>
    <el-dialog v-model="ifShowAnnouncement" :title="'公告 ' + version" :width="dialogWidth">
        <h2 style="display: inline">MayerTalk(beta)</h2>
        <p>开发阶段，功能尚不完善，还请谅解</p>
        <template v-if="invalidBrowser">
            <h2 style="color: red">
                您当前使用的浏览器无法导出截图，请使用其他浏览器
            </h2>
            <h3>Q：为什么？</h3>
            <h3>A：您当前使用的浏览不支持blob，而为了在本地导出截图，blob是必须的</h3>
            <h3>Q：什么浏览器支持blob？</h3>
            <h3>A：推荐Edge/Chrome</h3>
        </template>
        <template v-else>
            <p><b>所有内容均在本地生成，不会上传至服务器，不具备云端保存功能</b></p>
            <el-link href="/docs/guide/start.html" type="primary">快速上手 (首次使用推荐阅读)</el-link>
            <h3>
                v0.1.6
            </h3>
            <b>新增</b>
            <ul>
                <li>
                    转跳<br/>快捷键 ctrl + g
                </li>
                <li>
                    ctrl + e 启用编辑角色
                </li>
                <li>
                    ctrl + 点击 删除对话
                </li>
            </ul>
            <b>改动</b>
            <ul>
                <li>
                    移动 导入/导出/存档 至设置
                </li>
            </ul>
        </template>
        <div style="display: flex; margin-top: 10px">
            <el-link href="https://jq.qq.com/?_wv=1027&k=ImatbCzG" type="primary" style="margin-right: 5px"
                     target="_blank">
                交流群：560295639
            </el-link>
            <span style="border-left: solid 1px darkgrey"></span>
            <el-link href="https://github.com/Arkfans/MayerTalk" type="primary" style="margin: 0 5px;" target="_blank">
                Github
            </el-link>
            <span style="border-left: solid 1px darkgrey"></span>
            <el-link href="https://wj.qq.com/s2/11537223/aa61/" type="primary" style="margin-left: 5px;"
                     target="_blank">bug反馈
            </el-link>
        </div>
        <div style="position: absolute; bottom: 0; right: 0; color: #EEEEEE">咕咕</div>
    </el-dialog>
</template>

<style scoped>
ul {
    margin: 5px 0;
}
</style>
