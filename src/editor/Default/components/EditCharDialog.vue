<script setup lang="ts">
import { onUnmounted, ref, useTemplateRef } from 'vue'
import type { ElInput, UploadRawFile } from 'element-plus';

import { t } from '@/lib/lang/translate'
import message from '@/lib/utils/message'
import { blob2url, image2square, doAfterRefMounted } from '@/lib/utils/tool'

import { dialogWidth } from '@/lib/data/width'
import { closeShowHook } from '@/lib/data/showControl'
import type { CharsRecord } from '@/lib/data/dataTypes';
import { STATIC_URL, IsMobile } from '@/lib/data/constance'
import { DataControl, images, currCharId, currCharData } from '@/lib/data/data'

import SelectCharDialog from './SelectCharDialog.vue'
import type { CharacterSelectResult } from '@/lib/data/character'

// TODO fix 使用素材库创建角色后，短暂出现角色默认名称

const ifShow = ref(false)

onUnmounted(closeShowHook.on(() => {
    if (ifShow.value) {
        ifShow.value = false
    }
}))

const charData = ref<Partial<CharsRecord>>({})
const createChar = ref(false)
// 默认名候选，按优先级排序（首个优先级最高）：选中角色名 > 远程接口返回的该角色name备选
const defaultNames = ref<Array<string>>([])
const inputRef = useTemplateRef<InstanceType<typeof ElInput>>('inputRef')

const ifShowSelectChar = ref(false)

function genDefaultNames(name: string, extraNames?: Array<string>) {
    // 组合默认名候选：选中名优先，远程备选最低优先级；去空、去重、保序
    const names = [name, ...(extraNames || [])]
    return names.filter((item, i) => item && names.indexOf(item) === i)
}

function open(create: boolean, data?: CharsRecord & { extraNames?: Array<string> }) {
    // 启动角色编辑 create:是否创建角色
    createChar.value = create
    if (create) {
        if (data) {
            charData.value = { name: '', avatar: data.avatar }
            defaultNames.value = genDefaultNames(data.name, data.extraNames)
        } else {
            charData.value = { name: '' }
        }
    } else if (currCharId.value && currCharData.value) {
        charData.value = currCharData.value
    } else {
        message.notify(t.value.notify.pleaseSelectCharacter, message.warning)
        return
    }
    ifShow.value = true
    if (!IsMobile) {
        doAfterRefMounted(inputRef, (r) => {
            r.value.focus()
        })
    }
}

function clearCharData() {
    // 清除遗留数据
    if (createChar.value && charData.value.avatar) {
        DataControl.images.delete(charData.value.avatar)
    }
    charData.value = {}
    defaultNames.value = []
}

function uploadAvatar(uploadFile: UploadRawFile) {
    // 上传头像
    const url = blob2url(uploadFile)
    if (url) {
        const image = new Image()
        image.onload = () => {
            console.log('Image loaded');

            image2square(image).toBlob((blob) => {
                if (blob) {
                    DataControl.images.new(blob, (id) => {
                        if (charData.value.avatar) {
                            DataControl.images.delete(charData.value.avatar)
                        }
                        charData.value.avatar = id
                    })
                }
            })
        }
        image.src = url
    }
    return false
}

function editChar() {
    // 创建/删除角色
    if (createChar.value) {
        if (charData.value.name === '' && !defaultNames.value.length) {
            message.notify(t.value.notify.nameIsRequired, message.error)
            return
        }
        if (charData.value.name === '') {
            charData.value.name = defaultNames.value[0]
        }
        if (charData.value.avatar === undefined) {
            message.notify(t.value.notify.avatarIsRequired, message.error)
            return
        }
        DataControl.curr.setChar(DataControl.char.new(charData.value as CharsRecord))
        ifShow.value = false
        charData.value = {}
        message.notify(t.value.notify.createdSuccessfully, message.success)
    } else {
        message.confirm(
            t.value.notify.whetherToDeleteCharacter,
            t.value.noun.hint,
            () => {
                DataControl.char.delete(currCharId.value)
                DataControl.curr.setChar('', true)
                message.notify(t.value.notify.deletedSuccessfully, message.success)
                ifShow.value = false
            }
        )
    }
}

function handleSelect(char: CharacterSelectResult) {
    if (charData.value.avatar) {
        DataControl.images.delete(charData.value.avatar)
    }
    const { avatar, name, extraNames } = char
    charData.value.avatar = avatar
    defaultNames.value = genDefaultNames(name, extraNames)
}

function handleInputEnter() {
    if (createChar.value) {
        if (charData.value.avatar) {
            editChar()
        } else {
            ifShowSelectChar.value = true
        }
    } else {
        ifShow.value = false
    }
}

defineExpose({
    open
})
</script>

<template>
    <el-dialog v-model="ifShow" :title="createChar ? t.action.createCharacter : t.action.editCharacter"
        :width="dialogWidth" @closed="() => { DataControl.save('chars'); clearCharData() }">
        <div style="display: flex; flex-wrap: wrap">
            <div style="width: 100%; display: flex;">
                <el-upload action="#" drag :show-file-list="false" class="avatar-uploader"
                    accept="image/png, image/jpeg, image/gif"
                    :before-upload="(file: UploadRawFile) => { defaultNames = []; return uploadAvatar(file) }">
                    <div class="container"><img v-if="charData.avatar" alt=""
                            :src="Object.prototype.hasOwnProperty.call(images, charData.avatar) ? images[charData.avatar].src : STATIC_URL + charData.avatar" />
                        <el-icon v-else class="avatar-uploader-icon">
                            <IconPlus />
                        </el-icon>
                    </div>
                </el-upload>
                <div style="width: calc(100% - 100px); padding: 5px 0 0 10px">
                    {{ t.noun.name }}：
                    <el-input v-model="charData.name" style="margin-top: 10px" :placeholder="defaultNames[0]" ref="inputRef"
                        @keypress.enter="handleInputEnter"></el-input>
                    <div style="margin-top: 5px">
                        {{ t.noun.avatarPosition }}
                        <el-switch v-model="charData.right" :active-text="t.noun.left" :inactive-text="t.noun.right"
                            style="--el-switch-on-color: #a0cfff; --el-switch-off-color: #a0cfff"></el-switch>
                    </div>
                </div>
            </div>
            <div style="width: 100%; margin-top: 10px">
                <el-button style="width: 60%" @click="ifShowSelectChar = true">
                    {{ t.action.chooseCharacterFromLibrary }}
                </el-button>
                <el-button style="width: calc(40% - 12px)" @click="editChar">
                    {{ createChar ? t.action.create : t.action.delete }}
                </el-button>
            </div>
        </div>
    </el-dialog>
    <SelectCharDialog v-model="ifShowSelectChar" @select="handleSelect" />
</template>
