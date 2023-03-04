<script setup>
import { computed, ref } from 'vue'
import message from '@/lib/message'
import { DataControl } from '@/lib/data'
import { downloadData, uploadData } from '@/lib/versionControl'
import { dialogWidth, MobileView } from '@/lib/constance'

const props = defineProps(['modelValue'])
const emit = defineEmits([
    'showAnnounce',
    'showSettings',
    'showSavefile',
    'showAbout',
    'resizeWindow',
    'screenshot',
    'update:modelValue'
])

const ifShow = computed({
    get () {
        return props.modelValue
    },
    set (value) {
        emit('update:modelValue', value)
    }
})

function toGuide () {
    location.href = '/docs/guide/start.html'
}

const ifShowClear = ref(false)

function clearChats () {
    message.confirm(
        '即将清空所有对话',
        '提示',
        () => {
            DataControl.clear(0)
            DataControl.curr.setDialogue(0)
            ifShowClear.value = false
        }
    )
}

function clearAll () {
    message.confirm(
        '即将清空所有角色、对话',
        '提示',
        () => {
            DataControl.clear(1)
            DataControl.curr.setChar('', true)
            DataControl.curr.setDialogue(0)
            ifShowClear.value = false
        }
    )
}
</script>

<template>
    <div class="drawer" :class="ifShow?'show':''">
        <div class="bar" @click="$emit('screenshot')">
            <el-icon color="lightgrey" :size="35">
                <IconCrop/>
            </el-icon>
            截屏
        </div>
        <div class="bar" @click="$emit('showAnnounce')">
            <el-icon color="lightgrey" :size="35">
                <IconNotification/>
            </el-icon>
            公告
        </div>
        <div class="bar" @click="toGuide">
            <el-icon :size="35">
                <IconCompass/>
            </el-icon>
            指南
        </div>
        <div class="bar" @click="ifShowClear=true">
            <el-icon color="lightgrey" :size="35">
                <IconDelete/>
            </el-icon>
            清空
        </div>
        <el-dialog v-model="ifShowClear" title="请选择要清空的类型" :width="dialogWidth">
            <div style="display: flex; column-gap: 5px">
                <el-button size="large" style="width: 100%;" @click="clearChats">对话</el-button>
                <el-button size="large" style="width:100%; margin: 0" @click="clearAll">全部</el-button>
            </div>
        </el-dialog>
        <div class="bar" @click="$emit('showSavefile')">
            <el-icon color="lightgrey" :size="35">
                <IconCollection/>
            </el-icon>
            存档
        </div>
        <div class="bar" @click="DataControl.withdraw">
            <el-icon color="lightgrey" :size="35">
                <IconBack/>
            </el-icon>
            撤回
        </div>
        <div class="bar" @click="DataControl.redo">
            <el-icon color="lightgrey" :size="35">
                <IconRight/>
            </el-icon>
            重做
        </div>
        <div class="bar" @click="downloadData">
            <el-icon color="lightgrey" :size="35">
                <IconDownload/>
            </el-icon>
            导出
        </div>
        <div class="bar" style="position: relative">
            <el-icon color="lightgrey" :size="35">
                <IconUpload/>
            </el-icon>
            导入
            <el-upload
                action="#"
                :show-file-list="false"
                class="avatar-uploader"
                accept="application/json"
                :before-upload="(file) => uploadData(file, () => {emit('resizeWindow')})"
                style="position: absolute; width: 100%; height: 50px; overflow: hidden"
            >
                <div style=" width: 80px; height: 50px; user-select: none">
                </div>
            </el-upload>
        </div>
        <div class="bar" @click="$emit('showSettings')">
            <el-icon color="lightgrey" :size="35">
                <IconSetting/>
            </el-icon>
            设置
        </div>
        <div class="bar" @click="$emit('showAbout')">
            <el-icon color="lightgrey" :size="35">
                <IconCoffeeCup/>
            </el-icon>
            关于
        </div>
    </div>
    <Transition name="fade">
        <div v-if="ifShow && MobileView" @click="ifShow=false" class="drawer-mask"></div>
    </Transition>
</template>

<style src="../.scoped.css" scoped/>
<style>
.drawer-mask {
    opacity: 0.5;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
