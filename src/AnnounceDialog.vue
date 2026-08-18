<script setup lang="ts">
import { computed, onMounted } from 'vue'

import { saveData, getData } from '@/lib/utils/tool'
import type { SupportLangKey } from '@/lib/lang/constant'

import { config } from '@/lib/data/data'
import { IsSafari } from '@/lib/data/constance'
import { mainShow } from '@/lib/data/showControl'

defineEmits<{ showGuide: [boolean] }>()

const dialogWidth = Math.ceil(Math.min(window.innerWidth, 700) * 0.9)
const devInfo = __MAYERTALK_DEV_INFO__

onMounted(() => {
    if (devInfo) {
        mainShow.announcement.value = true
    } else if (getData('cache.announcementVersion') !== version) {
        mainShow.announcement.value = true
        saveData('cache.announcementVersion', version)
    } else if (invalidBrowser) {
        mainShow.announcement.value = true
    }
})

const invalidBrowser = /UCBrowser|Quark|QQBrowser|baidu/.test(navigator.userAgent) // hope detect successfully

type InvalidTranslation = Array<string>

const INVALID_BROWSER_TRANSLATION: Record<SupportLangKey, InvalidTranslation> = {
    zh_CN: [
        '您当前使用的浏览器无法导出截图，请使用其他浏览器',
        'Q：为什么？',
        'A：您当前使用的浏览不支持blob，而为了在本地导出截图，blob是必须的',
        'Q：什么浏览器支持blob？',
        'A：推荐Edge/Chrome'
    ],
    en_US: [
        'Your current browser cannot export screenshots, please use another browser',
        'Q: Why?',
        'A: Your current browser does not support blob, and blob is required to export screenshots locally',
        'Q: What browsers support blob?',
        'A: Recommend Edge/Chrome'
    ],
    ja_JP: [
        '現在お使いのブラウザではスクリーンショットをエクスポートできません。他のブラウザをお使いください',
        'Q：なぜですか？',
        'A：現在お使いのブラウザはblobをサポートしていません。ローカルでスクリーンショットをエクスポートするにはblobが必要です',
        'Q：どのブラウザがblobをサポートしていますか？',
        'A：Edge/Chromeをおすすめします'
    ],
    zh_TW: [
        '您當前使用的瀏覽器無法導出截圖，請使用其他瀏覽器',
        'Q：為什麼？',
        'A：您當前使用的瀏覽不支持blob，而為了在本地導出截圖，blob是必須的',
        'Q：什麼瀏覽器支持blob？',
        'A：推薦Edge/Chrome'
    ]
} as const

interface DefaultTranslation {
    announcement: string
    quicklyStart: string
    community: string
    feedback: string
    safariWarning: string
}

const DEFAULT_TRANSLATION: Record<SupportLangKey, DefaultTranslation> = {
    zh_CN: {
        announcement: '公告',
        quicklyStart: '快速上手 (首次使用推荐阅读)',
        community: '交流群：560295639',
        feedback: '反馈',
        safariWarning: '请注意，你所使用的Safari版本可能不支持下载文件，这会导致截图与导出数据失效。'
    },
    zh_TW: {
        announcement: '公告',
        quicklyStart: '快速上手 (首次使用推薦閱讀)',
        community: '交流群：560295639',
        feedback: '反饋',
        safariWarning: '請注意，你所使用的Safari版本可能不支持下載文件，這會導致截圖與導出數據失效。'
    },
    en_US: {
        announcement: 'Announcement',
        quicklyStart: 'Quick Start (Recommended for first-time users)',
        community: 'Communication group: 560295639 (tencent qq)',
        feedback: 'Feedback',
        safariWarning: 'Please note that the Safari version you are using may not support downloading files, which will cause screenshots and data export to fail.'
    },
    ja_JP: {
        announcement: 'アナウンス',
        quicklyStart: 'クイックスタート（初めての方におすすめ）',
        community: 'コミュニケーショングループ：560295639 (tencent qq)',
        feedback: 'フィードバック',
        safariWarning: 'ご注意ください、お使いのSafariバージョンはファイルのダウンロードをサポートしていない可能性があります。これによりスクリーンショットとデータのエクスポートが失敗する可能性があります。'
    }
} as const

interface AnnouncementTranslation {
    key: {
        feat: string
        optimize: string
        fix: string
    }
    feat: string[]
    optimize: string[]
    fix: string[]
}

const ANNOUNCEMENT_TRANSLATION: Record<SupportLangKey, AnnouncementTranslation> = {
    zh_CN: {
        key: {
            feat: '新增',
            optimize: '优化',
            fix: '修复'
        },
        feat: [],
        optimize: [],
        fix: []
    },
    zh_TW: {
        key: {
            feat: '新增',
            optimize: '優化',
            fix: '修復'
        },
        feat: [],
        optimize: [],
        fix: []
    },
    en_US: {
        key: {
            feat: 'Add',
            optimize: 'Optimize',
            fix: 'Fix'
        },
        feat: [],
        optimize: [],
        fix: []
    },
    ja_JP: {
        key: {
            feat: '追加',
            optimize: '最適化',
            fix: '修正'
        },
        feat: [],
        optimize: [],
        fix: []
    }
} as const

interface MajorUpdateTranslation {
    title: string
    content: string
    note: string
    hidden: string
}

const MAJOR_UPDATE_TRANSLATION: Record<SupportLangKey, MajorUpdateTranslation> = {
    zh_CN: {
        title: '重大更新',
        content: '现已支持NPC头像与差分🎉',
        note: '注：NPC差分仍在完善，如遇到了角色缺失或名称错误，欢迎加群反馈',
        hidden: '预言家，你还记得我吗'
    },
    zh_TW: {
        title: '重大更新',
        content: '現已支持NPC頭像與差分🎉',
        note: '註：NPC差分仍在完善，如遇到了角色缺失或名稱錯誤，歡迎加群反饋',
        hidden: '預言家，你還記得我嗎'
    },
    ja_JP: {
        title: 'メジャーアップデート',
        content: 'NPCアバターと差分をサポートしました🎉',
        note: '注：NPC差分はまだ改善中です。キャラクターが欠けている、または名前が間違っている場合は、グループにフィードバックしてください',
        hidden: '予言者よ、まだ私を覚えているか'
    },
    en_US: {
        title: 'Major Update',
        content: 'NPC avatars and differences are now supported 🎉',
        note: 'Note: NPC differences are still being improved. If you encounter missing characters or name errors, please join the group for feedback',
        hidden: 'Orcale, do you still remember me?'
    }
} as const

interface Translation {
    invalid: InvalidTranslation
    default: DefaultTranslation
    announcement: AnnouncementTranslation
    majorUpdate: MajorUpdateTranslation
}

function createTranslation(lang: SupportLangKey): Translation {
    return {
        invalid: INVALID_BROWSER_TRANSLATION[lang],
        default: DEFAULT_TRANSLATION[lang],
        announcement: ANNOUNCEMENT_TRANSLATION[lang],
        majorUpdate: MAJOR_UPDATE_TRANSLATION[lang]
    };
}

const TRANSLATION: Record<SupportLangKey, Translation> = {
    zh_CN: createTranslation('zh_CN'),
    zh_TW: createTranslation('zh_TW'),
    ja_JP: createTranslation('ja_JP'),
    en_US: createTranslation('en_US')
} as const;

const t = computed(() => {
    return TRANSLATION[config.value.lang]
})

interface DevTranslation {
    common: string
    ver: string
    endInfo: string
    mainSite: string
    devSite: string
    manual: string
    feedback: string
    ee: string
}

const DEV_TRANSLATION: Record<SupportLangKey, DevTranslation> = {
    zh_CN: {
        common: '您正处于开发站点，如有bug请加入交流群反馈',
        ver: 'Github Action 自动部署版本',
        endInfo: '此版本将于 {expireString} 结束测试',
        mainSite: '主站点',
        devSite: '查看Dev列表',
        manual: '查看指南',
        feedback: 'bug反馈',
        ee: '咕咕'
    },
    zh_TW: {
        common: '您正處於開發站點，如有bug請加入交流群反饋',
        ver: 'Github Action 自動部署版本',
        endInfo: '此版本將於 {expireString} 結束測試',
        mainSite: '主站點',
        devSite: '查看Dev列表',
        manual: '查看指南',
        feedback: 'bug反饋',
        ee: '咕咕'
    },
    ja_JP: {
        common: '開発ウェブサイトにアクセスしています。誤りを見つけた場合はアンケートにご記入ください。',
        ver: 'Github Action 自動デプロイバージョン',
        endInfo: 'このバージョンは {expireString} にテストを終了します',
        mainSite: 'メインサイト',
        devSite: 'Devリストを見る',
        manual: 'ガイドを見る',
        feedback: 'バグフィードバック',
        ee: '咕咕'
    },
    en_US: {
        common: 'You are developing a site. If you have any bugs, please fill out the questionnaire',
        ver: 'Github Action auto deploy version',
        endInfo: 'This version will end test at {expireString}',
        mainSite: 'Main Site',
        devSite: 'View Dev List',
        manual: 'View Guide',
        feedback: 'Bug Feedback',
        ee: 'GooGoo'
    }
}

const devT = computed<DevTranslation>(() => {
    const translation = DEV_TRANSLATION[config.value.lang]
    if (devInfo) {
        return {
            ...translation,
            endInfo: translation.endInfo.replace('{expireString}', devInfo.expireString)
        }
    }
    return translation
})

const version = 'v1.0.0'
</script>

<template>
    <el-dialog v-if="devInfo" v-model="mainShow.announcement.value" :title="'DevSite ' + devInfo.tag"
        :width="dialogWidth">
        <h1 style="display: inline">MayerTalk(dev)</h1>
        <p>{{ devT.common }}</p>
        <p>{{ devT.ver }}</p>
        <p>{{ devT.endInfo }}</p>
        <div style="display: flex">
            <el-link href="https://www.mayertalk.top" type="primary" style="margin-right: 5px">{{ devT.mainSite
                }}</el-link>
            <span style="border-left: solid 1px darkgrey"></span>
            <el-link href="https://dev.mayertalk.top" type="primary" style="margin: 0 5px">{{ devT.devSite }}</el-link>
            <span style="border-left: solid 1px darkgrey"></span>
            <el-link @click="$emit('showGuide', false)" href="javascript:void(0)" type="primary"
                style="margin-left: 5px">{{ devT.manual }}
            </el-link>
        </div>
        <div style="display: flex; margin-top: 10px" v-if="['zh_CN', 'zh_TW'].includes(config.lang)">
            <el-link href="https://jq.qq.com/?_wv=1027&k=ImatbCzG" type="primary" style="margin-right: 5px">
                交流群：560295639
            </el-link>
            <span style="border-left: solid 1px darkgrey"></span>
            <el-link href="https://wj.qq.com/s2/11537223/aa61/" type="primary" style="margin-left: 5px;">{{
                devT.feedback
                }}</el-link>
        </div>
        <div style="position: absolute; bottom: 0; right: 0; color: #EEEEEE">{{ devT.ee }}</div>
    </el-dialog>
    <el-dialog v-else v-model="mainShow.announcement.value" :title="t.default.announcement"
        :width="dialogWidth">
        <h1 style="display: inline">MayerTalk {{ version }}</h1>
        <template v-if="invalidBrowser">
            <template v-for="(translation, index) in t.invalid" :key="index">
                <h2 v-if="index === 0" style="color: red">
                    {{ translation }}
                </h2>
                <h3 v-else> {{ translation }}</h3>
            </template>
        </template>
        <template v-else>
            <br/>
            <h3 v-if="IsSafari">{{ t.default.safariWarning }}</h3>
            <h2>{{ t.majorUpdate.title }}</h2>
            <p class="rainbow-text">{{ t.majorUpdate.content }}</p>
            <p>{{ t.majorUpdate.note }}</p>
            <p style="color: #EEEEEE">{{ t.majorUpdate.hidden }}</p>
            <template v-for="key in ['feat', 'optimize', 'fix'] as const" :key="key">
                <template v-if="ANNOUNCEMENT_TRANSLATION.zh_CN[key] && t.announcement[key].length !== 0">
                    <h2>{{ t.announcement.key[key] }}</h2>
                    <ul>
                        <li v-for="(item, index) in t.announcement[key]" :key="index">{{ item }}</li>
                    </ul>
                </template>
            </template>
        </template>
        <div style="display: flex; margin-top: 10px">
            <el-link href="https://jq.qq.com/?_wv=1027&k=ImatbCzG" type="primary" style="margin-right: 5px"
                target="_blank">
                {{ t.default.community }}
            </el-link>
            <span style="border-left: solid 1px darkgrey"></span>
            <el-link href="https://github.com/MayerTalk/MayerTalk" type="primary" style="margin-left: 5px;"
                target="_blank">
                Github
            </el-link>
        </div>
        <div style="position: absolute; bottom: 0; right: 0; color: #EEEEEE">咕咕</div>
    </el-dialog>
</template>

<style scoped>
ul {
    margin: 5px 0;
}

img {
    width: 100%;
}

/* ===== 动态流动彩虹文字 ===== */
.rainbow-text {
    /* ② 彩虹渐变背景（宽度拉长 3 倍，方便移动） */
    background: linear-gradient(90deg,
            #ff0000,
            /* 红 */
            #ff7f00,
            /* 橙 */
            #ffff00,
            /* 黄 */
            #00ff00,
            /* 绿 */
            #0000ff,
            /* 蓝 */
            #4b0082,
            /* 靛 */
            #9400d3,
            /* 紫 */
            #ff0000
            /* 回到红色，形成循环 */
        );
    background-size: 300% 100%;
    /* 宽度 300%，高度 100% */

    /* ③ 将背景裁剪到文字形状（关键步骤） */
    -webkit-background-clip: text;
    background-clip: text;

    /* ④ 文字本身透明，露出背景 */
    color: transparent;

    /* ⑤ 绑定流动动画，4 秒一次，无限循环 */
    animation: flowRainbow 4s linear infinite;

    /* ⑥ 可选：增加一点发光阴影，提升质感 */
    text-shadow: 0 0 30px rgba(255, 255, 255, 0.2);
}

/* ===== 流动动画关键帧 ===== */
@keyframes flowRainbow {
    0% {
        background-position: 0% 0%;
        /* 起始位置 */
    }

    100% {
        background-position: 300% 0%;
        /* 终点位置，与 background-size 匹配 */
    }
}
</style>
