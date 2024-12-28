import { uuid } from '@/lib/utils/tool'

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
const IsMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent)
const IsSafari = /^(.(?!Chrome))*Safari/.test(navigator.userAgent)

export {
    StaticUrl,
    TypeDefault,
    TypeSeries,
    defaultWindowWidth,
    IsMobile,
    IsSafari
}
