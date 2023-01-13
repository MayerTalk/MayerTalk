import {uuid} from './lib/tool'

const TypeDict = {
    chat: '对话',
    monologue: '独白',
    image: '图片',
    option: '选项',
    select: '选择',
    title: '标题'
};

const TypeHint = {
    chat: 'text',
    monologue: 'text',
    image: 'bytes',
    option: 'list',
    select: 'text',
    title: 'text'
};

const TypeDefault = {
    chat: '',
    monologue: '',
    image: '',
    option: [[uuid(), '']],
    select: '',
    title: ''
};


export {
    TypeDict,
    TypeDefault,
    TypeHint
}