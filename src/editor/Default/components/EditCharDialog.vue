<script setup>
import { ref } from 'vue'
import { t } from '@/lib/lang/translate'
import SelectCharDialog from './SelectCharDialog.vue'

import { dialogWidth, StaticUrl, IsMobile } from '@/lib/constance'
import { DataControl, images, currCharId, currCharData } from '@/lib/data'
import message from '@/lib/message'
import { blob2url, image2square, doAfterMounted } from '@/lib/tool'

const ifShow = ref(false)

const charData = ref({})
const createChar = ref(false)
const defaultName = ref('')
const inputRef = ref(null)

const ifShowSelectChar = ref(false)

function open (create) {
    // 启动角色编辑 create:是否创建角色
    createChar.value = create
    if (create) {
        charData.value = { name: '' }
    } else if (currCharId.value) {
        charData.value = currCharData.value
    } else {
        message.notify(t.value.notify.pleaseSelectCharacter, message.warning)
        return
    }
    ifShow.value = true
    if (!IsMobile) {
        doAfterMounted(inputRef, (r) => {
            r.value.focus()
        })
    }
}

function clearCharData () {
    // 清除遗留数据
    if (createChar.value && Object.prototype.hasOwnProperty.call(charData.value, 'avatar')) {
        DataControl.image.delete(charData.value.avatar)
    }
    charData.value = {}
    defaultName.value = ''
}

function uploadAvatar (uploadFile) {
    // 上传头像
    const url = blob2url(uploadFile)
    if (url) {
        const image = new Image()
        image.onload = () => {
            image2square(image).toBlob((blob) => {
                DataControl.image.new(blob, (id) => {
                    DataControl.image.delete(charData.value.avatar)
                    charData.value.avatar = id
                })
            })
        }
        image.src = url
    }
    return false
}

function editChar () {
    // 创建/删除角色
    if (createChar.value) {
        if (charData.value.name === '' && !defaultName.value) {
            message.notify(t.value.notify.nameIsRequired, message.error)
            return
        }
        if (charData.value.name === '') {
            charData.value.name = defaultName.value
        }
        DataControl.curr.setChar(DataControl.char.new(charData.value))
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

function handleSelect (char) {
    if (Object.prototype.hasOwnProperty.call(charData.value, 'avatar')) {
        DataControl.image.delete(charData.value.avatar)
    }
    [charData.value.avatar, defaultName.value] = char
}

function handleInputEnter () {
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
    <el-dialog v-model="ifShow" :title="createChar?t.action.createCharacter:t.action.editCharacter" :width="dialogWidth"
               @closed="() => {DataControl.save('chars'); clearCharData()}">
        <div style="display: flex; flex-wrap: wrap">
            <div style="width: 100%; display: flex;">
                <el-upload
                    action="#"
                    drag
                    :show-file-list="false"
                    class="avatar-uploader"
                    accept="image/png, image/jpeg, image/gif"
                    :before-upload="(file) => {defaultName='';return uploadAvatar(file)}"
                >
                    <div class="container"><img v-if="charData.avatar"
                                                :src="Object.prototype.hasOwnProperty.call(images, charData.avatar) ? images[charData.avatar].src : StaticUrl + charData.avatar"/>
                        <el-icon v-else class="avatar-uploader-icon">
                            <IconPlus/>
                        </el-icon>
                    </div>
                </el-upload>
                <div style="width: calc(100% - 100px); padding: 5px 0 0 10px">
                    {{ t.noun.name }}：
                    <el-input v-model="charData.name" style="margin-top: 10px" :placeholder="defaultName" ref="inputRef"
                              @keypress.enter="handleInputEnter"></el-input>
                    <div style="margin-top: 5px">
                        {{ t.noun.avatarPosition }}
                        <el-switch
                            v-model="charData.right"
                            :active-text="t.noun.left"
                            :inactive-text="t.noun.right"
                            style="--el-switch-on-color: #a0cfff; --el-switch-off-color: #a0cfff"
                        ></el-switch>
                    </div>
                </div>
            </div>
            <div style="width: 100%; margin-top: 10px">
                <el-button style="width: 60%" @click="ifShowSelectChar=true">
                    {{ t.action.chooseCharacterFromLibrary }}
                </el-button>
                <el-button style="width: calc(40% - 12px)" @click="editChar">
                    {{ createChar ? t.action.create : t.action.delete }}
                </el-button>
            </div>
        </div>
    </el-dialog>
    <SelectCharDialog v-model="ifShowSelectChar" @select="handleSelect"/>
</template>
