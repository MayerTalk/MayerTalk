<script setup>
import { computed, onMounted } from 'vue'
import { saveData, getData } from './lib/utils/tool'
import { config } from '@/lib/data/data'
import { IsSafari } from '@/lib/data/constance'
import { mainShow } from '@/lib/data/showControl'

const dialogWidth = Math.ceil(Math.min(window.innerWidth, 700) * 0.9)

onMounted(() => {
    if (getData('cache.announcementVersion') !== version) {
        mainShow.announcement.value = true
        saveData('cache.announcementVersion', version)
    } else if (invalidBrowser) {
        mainShow.announcement.value = true
    }
})

const invalidBrowser = /UCBrowser|Quark|QQBrowser|baidu/.test(navigator.userAgent) // hope detect successfully

const invalidBrowserTranslate = {
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
}

const defaultTranslate = {
    zh_CN: {
        announcement: '公告',
        develop: '开发阶段，功能尚不完善，还请谅解',
        quicklyStart: '快速上手 (首次使用推荐阅读)',
        community: '交流群：560295639',
        feedback: '反馈',
        safariWarning: '请注意，你所使用的Safari版本可能不支持下载文件，这会导致截图与导出数据失效。'
    },
    zh_TW: {
        announcement: '公告',
        develop: '開發階段，功能尚不完善，還請諒解',
        quicklyStart: '快速上手 (首次使用推薦閱讀)',
        community: '交流群：560295639',
        feedback: '反饋',
        safariWarning: '請注意，你所使用的Safari版本可能不支持下載文件，這會導致截圖與導出數據失效。'
    },
    en_US: {
        announcement: 'Announcement',
        develop: 'In development stage, the function is not perfect, please understand',
        quicklyStart: 'Quick Start (Recommended for first-time users)',
        community: 'Communication group: 560295639',
        feedback: 'Feedback',
        safariWarning: 'Please note that the Safari version you are using may not support downloading files, which will cause screenshots and data export to fail.'
    },
    ja_JP: {
        announcement: 'アナウンス',
        develop: '開発段階、機能はまだ完全ではありません、ご理解ください',
        quicklyStart: 'クイックスタート（初めての方におすすめ）',
        community: 'コミュニケーショングループ：560295639',
        feedback: 'フィードバック',
        safariWarning: 'ご注意ください、お使いのSafariバージョンはファイルのダウンロードをサポートしていない可能性があります。これによりスクリーンショットとデータのエクスポートが失敗する可能性があります。'
    }
}

const announcementTranslate = {
    zh_CN: {
        key: {
            feat: '新增',
            optimize: '优化',
            fix: '修复'
        },
        feat: ['部分截图'],
        optimize: ['细化了清空，现在可分别清空 对话/角色/设置/存档/裁分点'],
        fix: ['清空未删除图片储存']
    },
    zh_TW: {
        key: {
            feat: '新增',
            optimize: '優化',
            fix: '修復'
        },
        feat: ['部分截圖'],
        optimize: ['細化了清空，現在可分別清空 對話/角色/設置/存檔/裁分點'],
        fix: ['清空未刪除圖片儲存']
    },
    en_US: {
        key: {
            feat: 'Add',
            optimize: 'Optimize',
            fix: 'Fix'
        },
        feat: ['Partial Screenshot'],
        optimize: ['Refined the clear function, now you can clear Dialogue/Role/Settings/Archive/Cut Point separately'],
        fix: ['Clear did not delete image storage']
    },
    ja_JP: {
        key: {
            feat: '追加',
            optimize: '最適化',
            fix: '修正'
        },
        ja_JP: {
            feat: ['部分的なスクリーンショット'],
            optimize: ['クリアを洗練し、今では ダイアログ/役割/設定/アーカイブ/カットポイント を個別にクリアできます'],
            fix: ['クリアは画像ストレージを削除しませんでした']
        }
    }
}

const translate = { zh_CN: {}, en_US: {}, ja_JP: {}, zh_TW: {} }

function syncTranslation (translation, key) {
    for (const lang in translation) {
        if (!Object.prototype.hasOwnProperty.call(translation, lang)) {
            continue
        }
        translate[lang][key] = {}
        for (const k in translation[lang]) {
            if (!Object.prototype.hasOwnProperty.call(translation[lang], k)) {
                continue
            }
            translate[lang][key][k] = translation[lang][k]
        }
    }
}

syncTranslation(invalidBrowserTranslate, 'invalid')
syncTranslation(defaultTranslate, 'default')
syncTranslation(announcementTranslate, 'announcement')

const t = computed(() => {
    return translate[config.value.lang || 'en_US']
})

const version = 'v0.2.3'
</script>

<template>
    <el-dialog v-model="mainShow.announcement.value" :title="t.default.announcement + ' ' + version"
               :width="dialogWidth">
        <h2 style="display: inline">MayerTalk(beta)</h2>
        <template v-if="invalidBrowser">
            <template v-for="(translation, index) in t.invalid" :key="index">
                <h2 v-if="index===0" style="color: red">
                    {{ translation }}
                </h2>
                <h3 v-else> {{ translation }}</h3>
            </template>
        </template>
        <template v-else>
            <p>{{ t.default.develop }}</p>
            <el-link href="/docs/guide/start.html" type="primary">{{ t.default.quicklyStart }}</el-link>
            <h3 v-if="IsSafari">{{ t.default.safariWarning }}</h3>
            <h3>
                {{ version }}
            </h3>
            <template v-for="key in ['feat','optimize','fix']" :key="key">
                <template v-if="announcementTranslate.zh_CN[key]">
                    <b>{{ t.announcement.key[key] }}</b>
                    <ul>
                        <li v-for="(item,index) in t.announcement[key]" :key="index">{{ item }}</li>
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
            <el-link href="https://github.com/MayerTalk/MayerTalk" type="primary" style="margin: 0 5px;"
                     target="_blank">
                Github
            </el-link>
            <span style="border-left: solid 1px darkgrey"></span>
            <el-link href="https://wj.qq.com/s2/13987607/3993/" type="primary" style="margin-left: 5px;"
                     target="_blank">{{ t.default.feedback }}
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
