import { uuid } from '@/lib/utils/tool'
import type { ChatType } from './dataTypes';

const StaticUrl = 'https://static.mayertalk.top/'



const CHAT_DEFAULT: Readonly<ChatType> = {
    chat: '', // 聊天内容
    monologue: '', // 独白内容
    image: '', // 图片 URL
    option: [[uuid(), '']], // 选项列表，每个选项包含 ID 和文本
    select: '', // 选择结果
    title: '' // 标题
};

const ChatSeries = {
    chat: 'Text',
    monologue: 'Text',
    image: 'Image',
    option: 'TextArray',
    select: 'Text',
    title: 'Text'
} as const

type ChatSeries = typeof ChatSeries;


const defaultWindowWidth: number = 520
const IsMobile: boolean = /Mobi|Android|iPhone/i.test(navigator.userAgent)
const IsSafari: boolean = /^(.(?!Chrome))*Safari/.test(navigator.userAgent)

export {
    StaticUrl,
    CHAT_DEFAULT,
    ChatSeries,
    defaultWindowWidth,
    IsMobile,
    IsSafari
}
