<script setup>
import { computed, ref } from 'vue'
import CharSelector from './CharSelector.vue'
import OptionDialog from '../type/OptionDialog.vue'

import { dialogWidth, TypeDict, TypeDefault, TypeSeries, MobileView } from '@/lib/constance'
import { chats, images, currDialogueIndex, currDialogueData, DataControl } from '@/lib/data'
import message from '@/lib/message'
import { copy, uuid, ensureClose, doAfterMounted } from '@/lib/tool'
import { uploadImage, deleteDialogue } from '@/lib/dialogue'

defineEmits(['showCopy'])

const ifShow = ref(false)

const dialogueData = ref({})
const editDialogue = ref(false)
const inputRef = ref(null)

function open (index) {
    editDialogue.value = true
    DataControl.curr.setDialogue(index)
    dialogueData.value = currDialogueData.value
    ifShow.value = true
    if (TypeSeries[dialogueData.value.type] === 'text' && !MobileView) {
        doAfterMounted(inputRef, (r) => {
            r.value.focus()
        })
    }
}

function close () {
    ifShow.value = false
}

const editor = computed(() => {
    if (!dialogueData.value.length) { return }
    if (TypeSeries[dialogueData.value.type] === 'text' || dialogueData.value.type === 'image') {
        return false
    } else if (dialogueData.value.type === 'option') {
        return OptionDialog
    } else {
        console.warn('Unknown Type Editor ' + dialogueData.value.type)
        return false
    }
})

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

function switchEdit (edit) {
    editDialogue.value = edit
    if (edit) {
        dialogueData.value = currDialogueData.value
    } else {
        dialogueData.value = { type: 'chat' }
    }
}

function delDialogue () {
    message.confirm(
        '即将删除该对话',
        '提示',
        () => {
            deleteDialogue(currDialogueIndex.value)
            message.notify('删除成功', message.success)
            ifShow.value = false
        }
    )
}

function insertDialogue () {
    if (dialogueData.value.char === undefined) {
        message.notify('请选择角色', message.warning)
        return
    }
    if (!dialogueData.value.type) {
        message.notify('请选择类型', message.warning)
        return
    }
    dialogueData.value.id = uuid()
    chats.value.splice(currDialogueIndex.value, 0, copy(dialogueData.value))
    message.notify('插入成功', message.success)
    dialogueData.value = {}
    ifShow.value = false
}

defineExpose({
    open,
    close
})
</script>

<template>
    <el-dialog v-model="ifShow" :title="editDialogue?'编辑对话':'插入对话'" :width="dialogWidth"
               @closed="handleClose"
               :before-close="editDialogue?null:ensureClose">
        <component v-if="editor" :is="editor" v-model="dialogueData.content"/>
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
        ></el-input>
        <div class="edit-bar" style="margin-top: 5px">
            <div style="width: calc(50% - 2px); display: flex">
                <CharSelector v-model="dialogueData.char" narration/>
            </div>
            <div style="width: calc(50% - 3px); margin-left: 5px; display: flex">
                <el-select v-model="dialogueData.type" style="flex-grow: 1"
                           :disabled="['image','option'].indexOf(dialogueData.type) !== -1 && editDialogue"
                           placeholder="类型"
                           @change="() => {if(!editDialogue) {dialogueData.content=TypeDefault[dialogueData.type]}}"
                >
                    <el-option
                        v-for="(text, type) in TypeDict"
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
                <el-button style="width: 100%" @click="delDialogue">删除</el-button>
                <el-button style="width: 100%; margin-left: 0" @click="$emit('showCopy',true)">复读</el-button>
                <el-button style="width: 100%; margin-left: 0" @click="switchEdit(false)">向上插入
                </el-button>
            </div>
            <div v-else class="column-display" style="width: 100%; margin-top: 5px">
                <el-button style="width: 100%" @click="insertDialogue">插入</el-button>
                <el-button style="width: 100%; margin-left: 0"
                           @click="() => {clearDialogueData();switchEdit(true)}">返回
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

.column-display {
    display: flex;
    column-gap: 5px;
}
</style>
