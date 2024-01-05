<script setup>
import { computed } from 'vue'
import { config } from '@/lib/data/data'
import { mainShow } from '@/lib/data/showControl'

const dialogWidth = Math.ceil(Math.min(window.innerWidth, 700) * 0.9)

const contributors = [
    ['meeboo3', 'meeboo3', '118372959'],
    ['Lightyears', '1MLightyears', '31664721']
]

const translate = {
    zh_CN: {
        title: '关于',
        about: '明日方舟对话编辑器，以明日方舟「叙拉古人」活动对话为蓝本开发，目前仍处于beta阶段',
        devSite: '开发站点',
        contributor: '贡献者',
        statement: '声明',
        statementContent: '网站内使用的游戏图片、文本原文，仅用于更好地表现游戏资料，其版权属于 Arknights/上海鹰角网络科技有限公司'
    },
    zh_TW: {
        title: '關於',
        about: '明日方舟對話編輯器，以明日方舟「叙拉古人」活動對話為藍本開發，目前仍處於beta階段',
        devSite: '開發站點',
        contributor: '貢獻者',
        statement: '聲明',
        statementContent: '網站內使用的遊戲圖片、文本原文，僅用於更好地表現遊戲資料，其版權屬於 Arknights/上海鷹角網絡科技有限公司'
    },
    ja_JP: {
        title: '約',
        about: 'アークナイツ対話エディター、アークナイツ「シラクザーノ」イベントの対話を基に開発され、現在まだベータ段階にあります',
        devSite: '開発サイト',
        contributor: '貢献者',
        statement: '声明',
        statementContent: 'このウェブサイトで使用されるゲーム画像やオリジナルテキストは、ゲーム情報をより良く表示するためにのみ使用され、その著作権はArknights/上海鷹角ネットワーク科学技術有限公司に帰属します'
    },
    en_US: {
        title: 'About',
        about: "Arknights Dialogue Editor, developed based on the dialogue of the Arknights 'IL Siracusano' activity, is currently still in beta stage",
        devSite: 'Development site',
        contributor: 'Contributor',
        statement: 'Statement',
        statementContent: 'The game images and original text used on this website are only used to better display game information, and their copyrights belong to Arknights/Shanghai Hypergryph Network Technology Co., Ltd.'
    }
}

const t = computed(() => {
    return translate[config.value.lang || 'en_US']
})
</script>

<template>
    <el-dialog v-model="mainShow.about.value" :title="t.title" :width="dialogWidth">
        <h2 style="display: inline">MayerTalk(beta)</h2><br/>
        <p>{{ t.about }}</p>
        <p style="display: flex; align-items: center">Github:
            <el-link href="https://github.com/MayerTalk/MayerTalk" type="primary" style="margin-left: 5px"
                     target="_blank">
                MayerTalk/MayerTalk
            </el-link>
        </p>
        <p style="display: flex; align-items: center">{{ t.devSite }}:
            <el-link href="https://dev.mayertalk.top/" type="primary" style="margin-left: 5px">
                dev.mayertalk.top
            </el-link>
        </p>
        <h3>{{ t.contributor }}</h3>
        <div class="contributors">
            <div v-for="user in contributors" :title="user[0]" class="avatar" :key="user[2]">
                <a :href="'https://github.com/'+user[1]" target="_blank">
                    <img :src="'https://avatars.githubusercontent.com/u/' + user[2] + '?v=4'" alt=""/>
                </a>
            </div>
        </div>
        <h3>{{ t.statement }}</h3>
        {{ t.statementContent }}
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
