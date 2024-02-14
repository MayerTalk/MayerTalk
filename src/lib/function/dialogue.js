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
import Hook from '@/lib/utils/hook'

const textarea = ref('')

const DialogueHook = {
    create: new Hook(),
    update: new Hook(),
    copy: new Hook(),
    click: new Hook()
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
    DialogueHook.create.call({ data, config })
}

function copyDialogue (index, data = {}, config = {}) {
    data = {
        ...chats.value[index],
        ...data,
        char: Object.prototype.hasOwnProperty.call(data, 'char') ? data.char : currCharId.value,
        id: data.id || uuid()
    }
    if (data.type === 'image') {
        DataControl.image.count(data.content)
    }
    chats.value.push(data)
    DialogueHook.copy.call({
        data,
        index,
        config
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

function findDialoguesById (id1, id2) {
    const dialogues = []
    let select = false
    for (let i = 0; i < chats.value.length; i++) {
        const data = chats.value[i]
        if (select) {
            dialogues.push(data.id)
        }
        if (data.id === id1 || data.id === id2) {
            if (select) {
                break
            } else {
                dialogues.push(data.id)
                select = true
            }
        }
    }
    return dialogues
}

export {
    DialogueHook,
    createDialogue,
    createTextDialogue,
    createImageDialogue,
    copyDialogue,
    deleteDialogue,
    uploadImage,
    textarea,
    findDialoguesById
}
