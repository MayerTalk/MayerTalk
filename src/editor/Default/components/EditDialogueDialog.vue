<script setup lang="ts">
import { onUnmounted, ref, useTemplateRef } from 'vue'
import type { ElInput, UploadRawFile } from 'element-plus'

import { t } from '@/lib/lang/translate'
import message from '@/lib/utils/message'
import { uploadImage, deleteDialogue, DialogueHook } from '@/lib/function/dialogue'
import { copy, uuid, ensureClose, doAfterRefMounted, assertNonValue } from '@/lib/utils/tool'

import { dialogWidth } from '@/lib/data/width'
import { closeShowHook } from '@/lib/data/showControl'
import type { ChatsRecord } from '@/lib/data/dataTypes'
import { CHAT_DEFAULT, CHAT_SERIES, IsMobile } from '@/lib/data/constance'
import { chats, images, currDialogueIndex, currDialogueData, DataControl } from '@/lib/data/data'

import { defaultShow } from '@/editor/Default/lib/showControl'

import CharSelector from './CharSelector.vue'
import OptionDialog from '@/editor/Default/type/OptionDialog.vue'


const ifShow = ref(false)

onUnmounted(closeShowHook.on(() => {
    if (ifShow.value) {
        ifShow.value = false
    }
}))

const editDialogue = ref(false)
const dialogueData = ref<ChatsRecord | null>(null)
const inputRef = useTemplateRef<InstanceType<typeof ElInput>>('inputRef')
let currType: keyof typeof CHAT_DEFAULT
const Editor = {
    option: OptionDialog
}

function open(index: number) {
    editDialogue.value = true
    dialogueData.value = DataControl.curr.setDialogue(index) as ChatsRecord
    assertNonValue(dialogueData.value, 'dialogueData')
    currType = dialogueData.value.type as keyof typeof CHAT_DEFAULT
    ifShow.value = true
    if (CHAT_SERIES[dialogueData.value.type] === 'Text' && !IsMobile) {
        doAfterRefMounted(inputRef, (r) => {
            r.value.focus()
        })
    }
}

function close() {
    ifShow.value = false
}

function clearDialogueData() {
    if (dialogueData.value && !editDialogue.value && dialogueData.value.type === 'image') {
        DataControl.images.delete(dialogueData.value.content)
    }
    dialogueData.value = null
}

function handleClose() {
    if (editDialogue.value && currDialogueData.value) {
        DialogueHook.update.call({
            data: currDialogueData.value,
            index: currDialogueIndex.value
        })
    }
    clearDialogueData()
    editDialogue.value = false
    DataControl.curr.setDialogue(-1)
    DataControl.save('chats')
}

function handleChangeType(value) {
    // 当类型数据格式不同时，重置为默认值
    if (dialogueData.value && CHAT_SERIES[currType] !== CHAT_SERIES[value]) {
        dialogueData.value.content = CHAT_DEFAULT[dialogueData.value.type]
    }
    currType = value
}

function switchEdit(edit: boolean) {
    editDialogue.value = edit
    if (edit) {
        dialogueData.value = currDialogueData.value as ChatsRecord
    } else {
        // TODO 优化新建对话类型提示
        dialogueData.value = { type: 'chat', data: {} } as ChatsRecord
    }
    currType = dialogueData.value.type as keyof typeof CHAT_DEFAULT
}

function delDialogue() {
    message.confirm(
        t.value.notify.whetherToDeleteChat,
        t.value.noun.hint,
        () => {
            deleteDialogue(currDialogueIndex.value)
            message.notify(t.value.notify.deletedSuccessfully, message.success)
            ifShow.value = false
        }
    )
}

function insertDialogue() {
    assertNonValue(dialogueData.value, 'dialogueData')
    if (dialogueData.value.char === undefined) {
        message.notify(t.value.notify.pleaseSelectCharacter, message.warning)
        return
    }
    if (!dialogueData.value.type) {
        message.notify(t.value.notify.pleaseSelectType, message.warning)
        return
    }
    dialogueData.value.id = uuid()
    chats.value.splice(currDialogueIndex.value, 0, copy(dialogueData.value))
    message.notify(t.value.notify.insertedSuccessfully, message.success)
    dialogueData.value = null
    ifShow.value = false
}

defineExpose({
    open,
    close
})
</script>

<template>
    <el-dialog v-model="ifShow" :title="editDialogue ? t.action.editChat : t.action.insertChat" :width="dialogWidth"
        @closed="handleClose" :before-close="editDialogue ? null : ensureClose">
        <template v-if="dialogueData">
            <component v-if="Editor[dialogueData.type]" :is="Editor[dialogueData.type]"
                v-model="dialogueData.content" />
                <!-- ↑假报错，typescript检查能通过 -->
            <el-upload v-else-if="dialogueData.type === 'image'" action="#" drag :show-file-list="false"
                class="image-uploader" accept="image/png, image/jpeg, image/gif"
                :before-upload="(file: UploadRawFile) => { return uploadImage(dialogueData as ChatsRecord, file) }">
                <div class="container">
                    <el-scrollbar v-if="images[dialogueData.content]">
                        <img alt="" :src="images[dialogueData.content].src" style="width:100%" />
                    </el-scrollbar>

                    <el-icon v-else class="avatar-uploader-icon">
                        <IconPlus />
                    </el-icon>
                </div>
            </el-upload>
            <el-input v-else v-model="dialogueData.content" :autosize="{ minRows: 1, maxRows: 5 }" resize="none"
                type="textarea" :disabled="dialogueData.type === 'image'" ref="inputRef"
                @keydown.ctrl.enter="ifShow = false"></el-input>
            <div class="edit-bar" style="margin-top: 5px">
                <div style="width: calc(50% - 2px); display: flex">
                    <CharSelector v-model="dialogueData.char as string" narration />
                </div>
                <div style="width: calc(50% - 3px); margin-left: 5px; display: flex">
                    <el-select v-model="dialogueData.type" style="flex-grow: 1"
                        :disabled="['image', 'option'].indexOf(dialogueData.type) !== -1 && editDialogue"
                        :placeholder="t.noun.type" @change="handleChangeType">
                        <el-option v-for="(text, type) in t.name.typeDict" :key="type" :label="text" :value="type"
                            :disabled="['image', 'option'].indexOf(type) !== -1 && editDialogue" />
                    </el-select>
                </div>
                <div class="divider"></div>
                <div style="display: flex; align-items: center">
                    {{ t.action.cutBelow }}
                    <el-switch v-model="dialogueData.data.cutPoint" style="margin-left: 5px"
                        @change="(v: boolean) => { !v && dialogueData && delete dialogueData.data.cutPoint }" />
                </div>
                <div class="divider"></div>
                <div v-if="editDialogue" class="column-display" style="width: 100%; margin-top: 5px">
                    <el-button style="width: 100%" @click="delDialogue">{{ t.action.delete }}</el-button>
                    <el-button style="width: 100%; margin-left: 0" @click="defaultShow.copy.value = true">{{
                        t.action.repeat
                    }}
                    </el-button>
                    <el-button style="width: 100%; margin-left: 0" @click="switchEdit(false)">{{ t.action.insertUp }}
                    </el-button>
                </div>
                <div v-else class="column-display" style="width: 100%; margin-top: 5px">
                    <el-button style="width: 100%" @click="insertDialogue">{{ t.action.insert }}</el-button>
                    <el-button style="width: 100%; margin-left: 0"
                        @click="() => { clearDialogueData(); switchEdit(true) }"> {{ t.action.return }}
                    </el-button>
                </div>
            </div>
        </template>
        <template v-else>
            Oops! Something went wrong.
        </template>
    </el-dialog>

</template>

<style scoped>
.image-uploader .el-upload:hover {
    border-color: var(--el-color-primary);
}

.container {
    width: 100%;
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.edit-bar {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
}

.divider {
    width: 100%;
    height: 5px;
    margin: 2px 0;
    border-bottom: var(--el-border-color) dashed 1px
}
</style>
