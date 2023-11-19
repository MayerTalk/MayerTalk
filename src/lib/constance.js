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
    chat: 'Text',
    monologue: 'Text',
    image: 'Image',
    option: 'TextArray',
    select: 'Text',
    title: 'Text'
}

const defaultWidth = 520
// #21 后 document.body.clientWidth 比实际视窗小（Why？）
const windowWidth = Math.min(defaultWidth, window.innerWidth)
const dialogWidth = Math.ceil(windowWidth * 0.9)
const WindowHeight = window.innerHeight
const MobileView = !(window.innerWidth - defaultWidth > 250)
const IsMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent)
const IsSafari = /^(.(?!Chrome))*Safari/.test(navigator.userAgent) || true

export {
    StaticUrl,
    TypeDefault,
    TypeSeries,
    windowWidth,
    dialogWidth,
    MobileView,
    WindowHeight,
    IsMobile,
    IsSafari
}
