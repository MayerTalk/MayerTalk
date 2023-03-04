import { uuid } from '@/lib/tool'

const StaticUrl = 'https://static.mayertalk.top/'

const TypeDict = {
    chat: '对话',
    monologue: '独白',
    image: '图片',
    option: '选项',
    select: '选择',
    title: '标题'
}

const TypeDefault = {
    chat: '',
    monologue: '',
    image: '',
    option: [[uuid(), '']],
    select: '',
    title: ''
}

const defaultWidth = 520
const windowWidth = Math.min(defaultWidth, document.body.clientWidth)
const dialogWidth = Math.ceil(windowWidth * 0.9)
const MobileView = !(windowWidth - defaultWidth > 250)

export {
    StaticUrl,
    TypeDict,
    TypeDefault,
    windowWidth,
    dialogWidth,
    MobileView
}
