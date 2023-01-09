import {uuid} from './lib/tool'

const TypeDict = {
    chat: '对话',
    monologue: '独白',
    image: '图片',
    option: '选项',
    select: '选择',
    title: '标题'
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
    TypeDefault
}