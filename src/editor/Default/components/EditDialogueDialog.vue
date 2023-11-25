<script setup>
import { ref } from 'vue'
import { t } from '@/lib/lang/translate'
import CharSelector from './CharSelector.vue'
import OptionDialog from '../type/OptionDialog.vue'

import { dialogWidth, TypeDefault, TypeSeries, IsMobile } from '@/lib/constance'
import { chats, images, currDialogueIndex, currDialogueData, DataControl } from '@/lib/data'
import message from '@/lib/message'
import { copy, uuid, ensureClose, doAfterRefMounted } from '@/lib/tool'
import { uploadImage, deleteDialogue } from '@/lib/dialogue'

defineEmits(['showCopy'])

const ifShow = ref(false)

const dialogueData = ref({})
const editDialogue = ref(false)
const inputRef = ref(null)
let currType
const Editor = {
    option: OptionDialog
}

function open (index) {
    editDialogue.value = true
    DataControl.curr.setDialogue(index)
    dialogueData.value = currDialogueData.value
    currType = dialogueData.value.type
    ifShow.value = true
    if (TypeSeries[dialogueData.value.type] === 'Text' && !IsMobile) {
        doAfterRefMounted(inputRef, (r) => {
            r.value.focus()
        })
    }
}

function close () {
    ifShow.value = false
}

function clearDialogueData () {
    if (!editDialogue.value && dialogueData.value.type === 'image') {
        DataControl.image.delete(dialogueData.value.content)
    }
    dialogueData.value = {}
}

function handleClose () {
    clearDialogueData()
    editDialogue.value = false
    DataControl.curr.setDialogue(-1)
    DataControl.save('chats')
}

function handleChangeType (value) {
    // 当类型数据格式不同时，重置为默认值
    if (TypeSeries[currType] !== TypeSeries[value]) {
        dialogueData.value.content = TypeDefault[dialogueData.value.type]
    }
    currType = value
}

function switchEdit (edit) {
    editDialogue.value = edit
    if (edit) {
        dialogueData.value = currDialogueData.value
    } else {
        dialogueData.value = { type: 'chat' }
    }
    currType = dialogueData.value.type
}

function delDialogue () {
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

function insertDialogue () {
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
    dialogueData.value = {}
    ifShow.value = false
}

defineExpose({
    open,
    close
})
</script>

<template>
    <el-dialog v-model="ifShow" :title="editDialogue?t.action.editChat:t.action.insertChat" :width="dialogWidth"
               @closed="handleClose"
               :before-close="editDialogue?null:ensureClose">
        <component v-if="Editor[dialogueData.type]" :is="Editor[dialogueData.type]" v-model="dialogueData.content"/>
        <el-upload v-else-if="dialogueData.type==='image'"
                   action="#"
                   drag
                   :show-file-list="false"
                   class="image-uploader"
                   accept="image/png, image/jpeg, image/gif"
                   :before-upload="(file) => {return uploadImage(dialogueData, file)}"
        >
            <div class="container">
                <el-scrollbar v-if="images[dialogueData.content]">
                    <img :src="images[dialogueData.content].src" style="width:100%"/>
                </el-scrollbar>

                <el-icon v-else class="avatar-uploader-icon">
                    <IconPlus/>
                </el-icon>
            </div>
        </el-upload>
        <el-input v-else
                  v-model="dialogueData.content"
                  :autosize="{minRows: 1, maxRows: 5}"
                  resize="none"
                  type="textarea"
                  :disabled="dialogueData.type==='image'"
                  ref="inputRef"
                  @keydown.ctrl.enter="ifShow=false"
        ></el-input>
        <div class="edit-bar" style="margin-top: 5px">
            <div style="width: calc(50% - 2px); display: flex">
                <CharSelector v-model="dialogueData.char" narration/>
            </div>
            <div style="width: calc(50% - 3px); margin-left: 5px; display: flex">
                <el-select v-model="dialogueData.type" style="flex-grow: 1"
                           :disabled="['image','option'].indexOf(dialogueData.type) !== -1 && editDialogue"
                           :placeholder="t.noun.type"
                           @change="handleChangeType"
                >
                    <el-option
                        v-for="(text, type) in t.name.typeDict"
                        :key="type"
                        :label="text"
                        :value="type"
                        :disabled="['image','option'].indexOf(type) !== -1 && editDialogue"
                    />
                </el-select>
            </div>
            <div
                style="width: 100%;height: 5px; margin: 2px 0; border-bottom: var(--el-border-color) dashed 1px"></div>
            <div v-if="editDialogue" class="column-display" style="width: 100%; margin-top: 5px">
                <el-button style="width: 100%" @click="delDialogue">{{ t.action.delete }}</el-button>
                <el-button style="width: 100%; margin-left: 0" @click="$emit('showCopy',true)">{{ t.action.repeat }}</el-button>
                <el-button style="width: 100%; margin-left: 0" @click="switchEdit(false)">{{ t.action.insertUp }}
                </el-button>
            </div>
            <div v-else class="column-display" style="width: 100%; margin-top: 5px">
                <el-button style="width: 100%" @click="insertDialogue">{{ t.action.insert }}</el-button>
                <el-button style="width: 100%; margin-left: 0"
                           @click="() => {clearDialogueData();switchEdit(true)}"> {{ t.action.return }}
                </el-button>
            </div>
        </div>

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
</style>
