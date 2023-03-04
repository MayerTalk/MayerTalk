import { ref } from 'vue'
import { uuid } from '@/lib/tool'
import message from '@/lib/message'
import tipControl from '@/lib/tip'
import {
    chats,
    currCharId,
    currDialogueData,
    DataControl
} from '@/lib/data'

const textarea = ref('')

const createDialogueHook = []

function createDialogue (data, locate = true) {
    data = {
        content: data.content,
        type: data.type,
        char: Object.prototype.hasOwnProperty.call(data, 'char') ? data.char : currCharId.value,
        id: data.id || uuid()
    }
    chats.value.push(data)
    DataControl.save('chats')
    createDialogueHook.forEach((hook) => {
        hook(data, locate)
    })
}

const copyDialogueHook = []
function copyDialogue (index, data = {}, config = {}) {
    data = {
        content: data.content || chats.value[index].content,
        type: data.type || chats.value[index].type,
        char: Object.prototype.hasOwnProperty.call(data, 'char') ? data.char : currCharId.value,
        id: data.id || uuid()
    }
    if (data.type === 'image') {
        DataControl.image.count(data.content)
    }
    chats.value.push(data)
    copyDialogueHook.forEach((hook) => {
        hook(index, data, config)
    })
}

function createTextDialogue (type) {
    if (textarea.value) {
        createDialogue({
            content: textarea.value,
            type
        })
        textarea.value = ''
    } else {
        message.notify('请在输入框内输入文本', message.info)
        tipControl.setTmpTip('请在此输入文本')
    }
}

function createImageDialogue (fileUpload) {
    DataControl.image.new(fileUpload, (id) => {
        createDialogue({
            content: id,
            type: 'image'
        })
    })
    return false
}

function uploadImage (data, fileUpload) {
    DataControl.image.new(fileUpload, (id) => {
        if (data.type === 'image') {
            DataControl.image.delete(data.content)
        }
        data.content = id
    })
    return false
}

export {
    createDialogue,
    createDialogueHook,
    createTextDialogue,
    createImageDialogue,
    copyDialogue,
    copyDialogueHook,
    uploadImage,
    textarea
}
