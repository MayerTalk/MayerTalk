<script setup lang="ts">
// Dev Server Announcement
import { computed, onMounted } from 'vue'
import { config } from '@/lib/data/data'
import info from './info.dev'
import { mainShow } from '@/lib/data/showControl'

defineEmits(['showGuide'])

const dialogWidth = Math.ceil(Math.min(window.innerWidth, 700) * 0.9)

interface Translation {
    common: string
    ver: string
    endInfo: string
    mainSite: string
    devSite: string
    manual: string
    feedback: string
    ee: string
}

const TRANSLATION:Record<string,Translation> = {
    zh_CN: {
        common: '您正处于开发站点，如有bug请加入交流群反馈',
        ver: 'Github Action 自动部署版本',
        endInfo: `此版本将于 ${info.expireString} 结束测试`,
        mainSite: '主站点',
        devSite: '查看Dev列表',
        manual: '查看指南',
        feedback: 'bug反馈',
        ee: '咕咕'
    },
    zh_TW: {
        common: '您正處於開發站點，如有bug請加入交流群反饋',
        ver: 'Github Action 自動部署版本',
        endInfo: `此版本將於 ${info.expireString} 結束測試`,
        mainSite: '主站點',
        devSite: '查看Dev列表',
        manual: '查看指南',
        feedback: 'bug反饋',
        ee: '咕咕'
    },
    ja_JP: {
        common: '開発ウェブサイトにアクセスしています。誤りを見つけた場合はアンケートにご記入ください。',
        ver: 'Github Action 自動デプロイバージョン',
        endInfo: `このバージョンは ${info.expireString} にテストを終了します`,
        mainSite: 'メインサイト',
        devSite: 'Devリストを見る',
        manual: 'ガイドを見る',
        feedback: 'バグフィードバック',
        ee: '咕咕'
    },
    en_US: {
        common: 'You are developing a site. If you have any bugs, please fill out the questionnaire',
        ver: 'Github Action auto deploy version',
        endInfo: `This version will end test at ${info.expireString}`,
        mainSite: 'Main Site',
        devSite: 'View Dev List',
        manual: 'View Guide',
        feedback: 'Bug Feedback',
        ee: 'GooGoo'
    }
}

const t = computed(() => {
    return TRANSLATION[config.value.lang]
})

onMounted(() => {
    mainShow.announcement.value = true
})
</script>

<template>
    <el-dialog v-model="mainShow.announcement.value" :title="'DevSite ' + info.tag" :width="dialogWidth">
        <h2 style="display: inline">MayerTalk(dev)</h2>
        <p>{{ t.common }}</p>
        <p>{{ t.ver }}</p>
        <p>{{ t.endInfo }}</p>
        <div style="display: flex">
            <el-link href="https://www.mayertalk.top" type="primary" style="margin-right: 5px">{{ t.mainSite }}</el-link>
            <span style="border-left: solid 1px darkgrey"></span>
            <el-link href="https://dev.mayertalk.top" type="primary" style="margin: 0 5px">{{ t.devSite }}</el-link>
            <span style="border-left: solid 1px darkgrey"></span>
            <el-link @click="$emit('showGuide', false)" href="javascript:void(0)" type="primary"
                     style="margin-left: 5px">{{ t.manual }}
            </el-link>
        </div>
        <div style="display: flex; margin-top: 10px" v-if="['zh_CN', 'zh_TW'].includes(config.lang)">
            <el-link href="https://jq.qq.com/?_wv=1027&k=ImatbCzG" type="primary" style="margin-right: 5px">
                交流群：560295639
            </el-link>
            <span style="border-left: solid 1px darkgrey"></span>
            <el-link href="https://wj.qq.com/s2/11537223/aa61/" type="primary" style="margin-left: 5px;">{{ t.feedback }}</el-link>
        </div>
        <div style="position: absolute; bottom: 0; right: 0; color: #EEEEEE">{{ t.ee }}</div>
    </el-dialog>
</template>

<style scoped>
    img {
        width: 100%;
    }
</style>
