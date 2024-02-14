<script setup>
import {
    disablePartialScreenshotView,
    partialChats,
    duringPartialScreenshot,
    partialScreenshotMultiSelect
} from '@/components/PartialScreenshot/partialScreenshotControl'
import { chats } from '@/lib/data/data'
</script>

<template>
    <div style="display: flex; color: white">
        <div class="column-display container">
            <div style="width: 40%; display: flex; justify-content: center" title="多选"
                 @click="partialScreenshotMultiSelect=!partialScreenshotMultiSelect">
                <el-icon :size="35" :color="partialScreenshotMultiSelect?'#B6E4F2':'white'">
                    <IconConnection/>
                </el-icon>
            </div>
            <div style="width: 60%; text-align: center">
                {{ Object.keys(partialChats).length }}/{{ chats.length }}
            </div>
            <div style="width: 100%; text-align: center" @click="duringPartialScreenshot=true">
                确认
            </div>
            <div style="width: 100%; text-align: center" @click="disablePartialScreenshotView">
                返回
            </div>
        </div>
    </div>
</template>

<style scoped>
.container {
    display: flex;
    align-items: center;
    padding: 5px 0;
    width: 100%;
    height: max-content;
    user-select: none;
}
</style>
