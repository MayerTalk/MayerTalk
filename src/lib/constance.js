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

const defaultWindowWidth = 520
// #21 后 document.body.clientWidth 比实际视窗小（Why？）
const windowWidth = Math.min(defaultWindowWidth, window.innerWidth)
const dialogWidth = Math.ceil(windowWidth * 0.9)
const WindowHeight = window.innerHeight
const IsMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent)
const IsSafari = /^(.(?!Chrome))*Safari/.test(navigator.userAgent)

export {
    StaticUrl,
    TypeDefault,
    TypeSeries,
    defaultWindowWidth,
    windowWidth,
    dialogWidth,
    WindowHeight,
    IsMobile,
    IsSafari
}
