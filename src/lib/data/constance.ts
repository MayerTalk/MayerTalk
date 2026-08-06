import { uuid } from '@/lib/utils/tool'
import type { ChatType } from './dataTypes';

const STATIC_URL = 'https://static.mayertalk.top/'

const SUPPORT_LANG = ['zh_CN', 'zh_TW', 'ja_JP', 'en_US'] as const

const CHAT_DEFAULT: Readonly<ChatType> = {
    chat: '', // 聊天内容
    monologue: '', // 独白内容
    image: '', // 图片 URL
    option: [[uuid(), '']], // 选项列表，每个选项包含 ID 和文本
    select: '', // 选择结果
    title: '' // 标题
}

const CHAT_SERIES = {
    chat: 'Text',
    monologue: 'Text',
    image: 'Image',
    option: 'TextArray',
    select: 'Text',
    title: 'Text'
} as const


const defaultWindowWidth: number = 520
const IsMobile: boolean = /Mobi|Android|iPhone/i.test(navigator.userAgent)
const IsSafari: boolean = /^(.(?!Chrome))*Safari/.test(navigator.userAgent)

export {
    SUPPORT_LANG,
    STATIC_URL,
    CHAT_DEFAULT,
    CHAT_SERIES,
    defaultWindowWidth,
    IsMobile,
    IsSafari
}
