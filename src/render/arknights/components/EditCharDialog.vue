<script setup>
import { ref } from 'vue'
import SelectCharDialog from './SelectCharDialog.vue'

import { dialogWidth, StaticUrl, MobileView } from '@/lib/constance'
import { DataControl, images, currCharId, currCharData } from '@/lib/data'
import message from '@/lib/message'
import { blob2url, image2square } from '@/lib/tool'

const ifShow = ref(false)

const charData = ref({})
const createChar = ref(false)
const defaultName = ref('')

const ifShowSelectChar = ref(false)

function open (create) {
    // 启动角色编辑 create:是否创建角色
    createChar.value = create
    if (create) {
        charData.value = { name: '' }
    } else if (currCharId.value) {
        charData.value = currCharData.value
    } else {
        message.notify('请选择角色', message.warning)
        return
    }
    ifShow.value = true
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
            message.notify('名字是必须的', message.error)
            return
        }
        if (charData.value.name === '') {
            charData.value.name = defaultName.value
        }
        DataControl.curr.setChar(DataControl.char.new(charData.value))
        ifShow.value = false
        charData.value = {}
        message.notify('创建成功', message.success)
        if (!MobileView) {
            document.getElementById('textarea').focus()
        }
    } else {
        message.confirm(
            '即将删除该角色',
            '提示',
            () => {
                DataControl.char.delete(currCharId.value)
                DataControl.curr.setChar('', true)
                message.notify('删除成功', message.success)
                ifShow.value = false
            }
        )
    }
}

function handleSelect (char) {
    if (Object.prototype.hasOwnProperty.call(charData.value, 'avatar')) {
        DataControl.image.delete(charData.value.avatar)
    }
    defaultName.value = char[2]
    charData.value.avatar = char[1]
}

defineExpose({
    open
})
</script>

<template>
    <el-dialog v-model="ifShow" :title="createChar?'创建新角色':'编辑角色'" :width="dialogWidth"
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
                    名称：
                    <el-input v-model="charData.name" style="margin-top: 10px" :placeholder="defaultName"
                              @keypress.enter="createChar && editChar()"></el-input>
                    <div style="margin-top: 5px">
                        头像位置
                        <el-switch
                            v-model="charData.right"
                            active-text="右"
                            inactive-text="左"
                            style="--el-switch-on-color: #a0cfff; --el-switch-off-color: #a0cfff"
                        ></el-switch>
                    </div>
                </div>
            </div>
            <div style="width: 100%; margin-top: 10px">
                <el-button style="width: 60%" @click="ifShowSelectChar=true">
                    从素材库中选择角色
                </el-button>
                <el-button style="width: calc(40% - 12px)" @click="editChar">
                    {{ createChar ? '创建' : '删除' }}
                </el-button>
            </div>
        </div>
    </el-dialog>
    <SelectCharDialog v-model="ifShowSelectChar" @select="handleSelect"/>
</template>

<style src="../.scoped.css" scoped/>
