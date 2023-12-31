import { ref } from 'vue'
import { t } from '@/lib/lang/translate'
import { Textarea, uuid } from '@/lib/utils/tool'
import message from '@/lib/utils/message'
import tipControl from '@/lib/function/tip'
import {
    chats,
    currCharId,
    DataControl
} from '@/lib/data/data'

const textarea = ref('')

const DialogueHook = {
    createHooks: [],
    onCreate (fn) {
        this.createHooks.push(fn)
    },
    callCreateHook (data, config) {
        this.createHooks.forEach((fn) => {
            fn(data, config)
        })
    },
    updateHooks: [],
    onUpdate (fn) {
        this.updateHooks.push(fn)
    },
    callUpdateHook (data, index) {
        this.updateHooks.forEach((fn) => {
            fn(data, index)
        })
    }
}

function createDialogue (data, config = {}) {
    data = {
        content: data.content,
        type: data.type,
        char: Object.prototype.hasOwnProperty.call(data, 'char') ? data.char : currCharId.value,
        id: data.id || uuid(),
        data: {}
    }
    chats.value.push(data)
    DataControl.save('chats')
    DialogueHook.callCreateHook(data, config)
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

function createTextDialogue (type, config = {}) {
    if (textarea.value) {
        createDialogue({
            content: textarea.value,
            type
        }, config)
        Textarea.focus()
        textarea.value = ''
    } else {
        message.notify(t.value.notify.pleaseEnterTextInTheInputBox, message.info)
        tipControl.setTmpTip(t.value.notify.pleaseEnterTextHere)
    }
}

function createImageDialogue (fileUpload, config = {}) {
    DataControl.image.new(fileUpload, (id) => {
        createDialogue({
            content: id,
            type: 'image'
        })
    }, config)
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

function deleteDialogue (index, config = {}) {
    const chat = chats.value.splice(index, 1)[0]
    if (chat.type === 'image') {
        DataControl.image.delete(chat.content)
    }
    if (config.save === undefined || config.save) {
        DataControl.save('chats')
    }
}

export {
    DialogueHook,
    createDialogue,
    createTextDialogue,
    createImageDialogue,
    copyDialogue,
    deleteDialogue,
    copyDialogueHook,
    uploadImage,
    textarea
}