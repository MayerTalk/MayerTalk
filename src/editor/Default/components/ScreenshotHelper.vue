<script setup>
import { computed } from 'vue'
import { dialogWidth } from '@/lib/constance'
import { t } from '@/lib/lang/translate'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])
let imageData = null

const ifShowScreenshotHelper = computed({
    get () {
        return props.modelValue
    },
    set (value) {
        emit('update:modelValue', value)
    }
})

function show (canvas) {
    ifShowScreenshotHelper.value = true
    canvas.style.height = null
    canvas.style.width = '100%'
    imageData = canvas
}

function onShow () {
    document.querySelector('#screenshotHelperContainer').appendChild(imageData)
}

defineExpose({
    show
})
</script>

<template>
    <el-dialog v-model="ifShowScreenshotHelper"
               :width="dialogWidth"
               :title="t.noun.screenshotHelper"
               @open="onShow"
               destroy-on-close>
        {{ t.tip.screenshotHelper }}
        <div style="width: 100%; margin-top: 15px">
            <el-scrollbar :max-height="400">
                <div style="width: 100%; display: flex" id="screenshotHelperContainer"></div>
            </el-scrollbar>
        </div>
    </el-dialog>
</template>

<style scoped>

</style>
