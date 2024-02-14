<script setup>
import { onMounted, onUnmounted } from 'vue'
import {
    sortedCutPoints,
    setCurrCutPoint,
    currCutPointIndex,
    cutPointQuickEditMode,
    getClosetCutPoint,
    disableCutPointView,
    prev,
    next
} from '@/components/ManualCutPoint/manualCoutPointControl'
import { t } from '@/lib/lang/translate'

onMounted(() => {
    setCurrCutPoint(sortedCutPoints.value.length && (getClosetCutPoint() + 1))
})

onMounted(() => {
    cutPointQuickEditMode.value = true
})
onUnmounted(() => {
    cutPointQuickEditMode.value = false
})
</script>

<template>
    <div style="display: flex; color: white">
        <div class="column-display container">
            <div style="width: 100%; text-align: center">
                {{ currCutPointIndex }}/{{ sortedCutPoints.length }}
            </div>
            <div style="width: 100%; display: flex; justify-content: center">
                <el-icon :color="cutPointQuickEditMode?'#B6E4F2':'white'" :size="35" :title="t.noun.quickEdit"
                         @click="cutPointQuickEditMode=!cutPointQuickEditMode">
                    <IconEdit/>
                </el-icon>
                <el-icon color="white" :size="35" style="margin-left: 5%" :title="t.action.previous"
                         @click="prev">
                    <IconTop/>
                </el-icon>
                <el-icon color="white" :size="35" style="margin-left: 5%" :title="t.action.next"
                         @click="next">
                    <IconBottom/>
                </el-icon>
            </div>
            <div style="width: 100%; text-align: center" @click="disableCutPointView">
                {{ t.action.return }}
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
