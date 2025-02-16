import { uuid } from '@/lib/utils/tool'

const StaticUrl = 'https://static.mayertalk.top/'

interface TypeDefault {
    chat: string
    monologue: string
    image: string
    option: Array<[string, string]> // uuid() 返回字符串
    select: string
    title: string
};

type TypeSeries = typeof TypeSeries;

const TypeDefault: Readonly<TypeDefault> = {
    chat: '', // 聊天内容
    monologue: '', // 独白内容
    image: '', // 图片 URL
    option: [[uuid(), '']], // 选项列表，每个选项包含 ID 和文本
    select: '', // 选择结果
    title: '' // 标题
};

const TypeSeries = {
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
    StaticUrl,
    TypeDefault,
    TypeSeries,
    defaultWindowWidth,
    IsMobile,
    IsSafari
}
