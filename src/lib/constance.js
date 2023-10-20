import { uuid } from '@/lib/tool'

const StaticUrl = 'https://static.mayertalk.top/'

const TypeDefault = {
    chat: '',
    monologue: '',
    image: '',
    option: [[uuid(), '']],
    select: '',
    title: ''
}

const TypeSeries = {
    chat: 'text',
    monologue: 'text',
    image: 'image',
    option: 'option',
    select: 'text',
    title: 'text'
}

const defaultWidth = 520
// #21 后 document.body.clientWidth 比实际视窗小（Why？）
const windowWidth = Math.min(defaultWidth, window.innerWidth)
const dialogWidth = Math.ceil(windowWidth * 0.9)
const MobileView = !(window.innerWidth - defaultWidth > 250)

export {
    StaticUrl,
    TypeDefault,
    TypeSeries,
    windowWidth,
    dialogWidth,
    MobileView
}
