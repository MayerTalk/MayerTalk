<script setup>
import { computed, onMounted } from 'vue'
import info from './info.dev'

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

const dialogWidth = Math.ceil(Math.min(document.body.clientWidth, 700) * 0.9)

onMounted(() => {
    ifShowAnnouncement.value = true
})
</script>

<template>
    <el-dialog v-model="ifShowAnnouncement" :title="'DevSite ' + info.tag" :width="dialogWidth">
        <h2 style="display: inline">MayerTalk(dev)</h2>
        <p>您正处于开发站点，如有bug请加入交流群反馈</p>
        <p>Github Action 自动部署版本</p>
        <p>此版本将于 <i>{{info.expireString}}</i> 结束测试</p>
        <div style="display: flex">
            <el-link href="https://www.mayertalk.top" type="primary" style="margin-right: 5px">主站点</el-link>
            <span style="border-left: solid 1px darkgrey"></span>
            <el-link href="https://dev.mayertalk.top" type="primary" style="margin: 0 5px">查看Dev列表</el-link>
            <span style="border-left: solid 1px darkgrey"></span>
            <el-link @click="$emit('showGuide', false)" href="javascript:void(0)" type="primary"
                     style="margin-left: 5px">查看指南
            </el-link>
        </div>
        <div style="display: flex; margin-top: 10px">
            <el-link href="https://jq.qq.com/?_wv=1027&k=ImatbCzG" type="primary" style="margin-right: 5px">
                交流群：560295639
            </el-link>
            <span style="border-left: solid 1px darkgrey"></span>
            <el-link href="https://wj.qq.com/s2/11537223/aa61/" type="primary" style="margin-left: 5px;">bug反馈</el-link>
        </div>
        <div style="position: absolute; bottom: 0; right: 0; color: #EEEEEE">咕咕</div>
    </el-dialog>
</template>

<style scoped>
    img {
        width: 100%;
    }
</style>
