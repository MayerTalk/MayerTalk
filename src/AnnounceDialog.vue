<script setup>
import { computed, onMounted } from 'vue'
import { saveData, getData } from './lib/tool'
import { config } from '@/lib/data'
import { IsSafari } from '@/lib/constance'

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

const dialogWidth = Math.ceil(Math.min(window.innerWidth, 700) * 0.9)

onMounted(() => {
    if (getData('cache.announcementVersion') !== version) {
        emit('update:modelValue', true)
        saveData('cache.announcementVersion', version)
    } else if (invalidBrowser) {
        emit('update:modelValue', true)
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
        reportBug: 'bug反馈',
        safariWarning: '请注意，你所使用的Safari版本可能不支持下载文件，这会导致截图与导出数据失效。'
    },
    zh_TW: {
        announcement: '公告',
        develop: '開發階段，功能尚不完善，還請諒解',
        quicklyStart: '快速上手 (首次使用推薦閱讀)',
        community: '交流群：560295639',
        reportBug: 'bug反饋',
        safariWarning: '請注意，你所使用的Safari版本可能不支持下載文件，這會導致截圖與導出數據失效。'
    },
    en_US: {
        announcement: 'Announcement',
        develop: 'In development stage, the function is not perfect, please understand',
        quicklyStart: 'Quick Start (Recommended for first-time users)',
        community: 'Communication group: 560295639',
        reportBug: 'Bug feedback',
        safariWarning: 'Please note that the Safari version you are using may not support downloading files, which will cause screenshots and data export to fail.'
    },
    ja_JP: {
        announcement: 'アナウンス',
        develop: '開発段階、機能はまだ完全ではありません、ご理解ください',
        quicklyStart: 'クイックスタート（初めての方におすすめ）',
        community: 'コミュニケーショングループ：560295639',
        reportBug: 'バグフィードバック',
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
        feat: ['一年的鏖战与守望', '数据统计', '水印'],
        optimize: ['现在文件名可以自定义了(截图-标题)'],
        fix: ['自动裁分长度计算错误', '无法搜索角色英文名', '无法搜索角色代号']
    },
    zh_TW: {
        key: {
            feat: '新增',
            optimize: '優化',
            fix: '修復'
        },
        feat: ['一年的鏖戰與守望', '數據統計', '水印'],
        optimize: ['現在文件名可以自定義了(截圖-標題)'],
        fix: ['自動裁分長度計算錯誤', '無法搜索角色英文名', '無法搜索角色代號']
    },
    en_US: {
        key: {
            feat: 'New',
            optimize: 'Optimize',
            fix: 'Fix'
        },
        feat: ['A year of fighting and waiting', 'Data statistics', 'Watermark'],
        optimize: ['Now the filename can be customized (screenshot-title)'],
        fix: ['Automatic cutting length calculation error', 'Cannot search for character English name', 'Cannot search for character code']
    },
    ja_JP: {
        key: {
            feat: '追加',
            optimize: '最適化',
            fix: '修正'
        },
        feat: ['1年間の戦いと待機', 'データ統計', 'ウォーターマーク'],
        optimize: ['今、ファイル名をカスタマイズできます（スクリーンショット-タイトル）'],
        fix: ['自動切り分け長さの計算エラー', 'キャラクターの英語名を検索できない', 'キャラクターコードを検索できない']
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

const version = 'v0.2.0'

</script>

<template>
    <el-dialog v-model="ifShowAnnouncement" :title="t.default.announcement + ' ' + version" :width="dialogWidth">
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
            <el-link href="/docs/guide/report_bug.html" type="primary" style="margin-left: 5px;"
                     target="_blank">{{ t.default.reportBug }}
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
