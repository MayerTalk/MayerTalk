<script setup>
import { ref, computed } from 'vue'
import { dialogWidth } from '@/lib/constance'
import { t } from '@/lib/lang/translate'
import { blob2url } from '@/lib/tool'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])
const imageData = ref(null)

const ifShowScreenshotHelper = computed({
    get () {
        return props.modelValue
    },
    set (value) {
        emit('update:modelValue', value)
    }
})

function show (canvas, blob) {
    ifShowScreenshotHelper.value = true
    imageData.value = blob2url(blob)
}

defineExpose({
    show
})
</script>

<template>
    <el-dialog v-model="ifShowScreenshotHelper" :width="dialogWidth" :title="t.noun.screenshotHelper">
        {{ t.tip.screenshotHelper }}
        <div style="width: 100%; margin-top: 15px; height: 400px; overflow:hidden;">
            <img :src="imageData" alt="" style="width: 100%"/>
        </div>
    </el-dialog>
</template>

<style scoped>

</style>
