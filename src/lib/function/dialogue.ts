import { ref } from 'vue'
import { t } from '@/lib/lang/translate'
import { Textarea, uuid } from '@/lib/utils/tool'
import message from '@/lib/utils/message'
import TipControl from '@/lib/function/tip'
import {
    chats,
    currCharId,
    DataControl
} from '@/lib/data/data'
import Hook from '@/lib/utils/hook'

import type * as DT from '@/lib/data/dataTypes'

const textarea = ref('')

const DialogueHook = {
    create: new Hook<{
        data: DT.ChatsRecord,
        config: unknown // 未使用 预留
    }>(),
    update: new Hook(),
    copy: new Hook<{
        data: DT.ChatsRecord,
        index: number,
        config: CopyDialogueConfig
    }>(),
    click: new Hook()
}

function createDialogue(param: Partial<DT.ChatsRecord>, config = {}) {
    const data: DT.ChatsRecord = {
        content: param.content,
        type: param.type,
        char: Object.prototype.hasOwnProperty.call(param, 'char') ? param.char : currCharId.value,
        id: param.id || uuid(),
        data: {}
    } as DT.ChatsRecord
    chats.value.push(data)
    DataControl.save('chats')
    DialogueHook.create.call({ data, config })
}

interface CopyDialogueConfig {
    locate?: boolean,
    save?: boolean
}

function copyDialogue(index: number, param: Partial<DT.ChatsRecord> = {}, config: CopyDialogueConfig = {}) {
    const data: DT.ChatsRecord = {
        ...chats.value[index],
        ...param,
        char: Object.prototype.hasOwnProperty.call(param, 'char') ? param.char : currCharId.value,
        id: param.id || uuid()
    } as DT.ChatsRecord
    if (data.type === 'image') {
        DataControl.images.count(data.content)
    }
    chats.value.push(data)
    DialogueHook.copy.call({
        data,
        index,
        config
    })
}

// TODO optimize type hint
function createTextDialogue(type: string, config = {}) {
    if (textarea.value) {
        createDialogue({
            content: textarea.value,
            type
        }, config)
        Textarea.focus()
        textarea.value = ''
    } else {
        message.notify(t.value.notify.pleaseEnterTextInTheInputBox, message.info)
        TipControl.setTmpTip(t.value.notify.pleaseEnterTextHere)
    }
}

function createImageDialogue(fileUpload: File, config = {}) {
    DataControl.images.new(fileUpload, (id) => {
        createDialogue({
            content: id,
            type: 'image'
        }, config)
    })
    return false
}

function uploadImage(data: DT.ChatsRecord, fileUpload: File): false {
    DataControl.images.new(fileUpload, (id) => {
        if (!id) {
            // TODO raise Expectation
            return false
        }
        if (data.type === 'image') {
            // 如果对话类型为image，删除旧图片
            DataControl.images.delete(data.content)
        }
        data.content = id
    })
    return false
}

function deleteDialogue(index: number, config: {
    save?: boolean
} = {}) {
    const chat = chats.value.splice(index, 1)[0]
    if (chat.type === 'image') {
        DataControl.images.delete(chat.content)
    }
    if (config.save === undefined || config.save) {
        DataControl.save('chats')
    }
}

function findDialoguesById(id1:string, id2:string) {
    const dialogues:Array<string> = []
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
