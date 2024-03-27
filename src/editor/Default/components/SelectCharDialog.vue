<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { t } from '@/lib/lang/translate'
import { loadSeries } from '@/lib/data/character'
import { dialogWidth } from '@/lib/data/width'
import SelectCharInstance from './SelectCharInstance.vue'
import { closeShowHook } from '@/lib/data/showControl'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue', 'select'])
const selector = ref(null)

const ifShow = computed({
    get () {
        return props.modelValue
    },
    set (value) {
        emit('update:modelValue', value)
    }
})

onUnmounted(closeShowHook.on(() => {
    if (ifShow.value) {
        ifShow.value = false
    }
}))

</script>

<template>
    <el-dialog v-model="ifShow" :title="t.action.selectChar" :width="dialogWidth" top="10vh"
               @open="loadSeries.arknights();selector.autoFocus()"
               @closed="selector.search=''">
        <SelectCharInstance max-height="60vh" ref="selector" @select="(v) => {$emit('select',v);ifShow=false}"/>
    </el-dialog>
</template>
