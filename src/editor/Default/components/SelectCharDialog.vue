<script setup>
import { ref, computed } from 'vue'
import { t } from '@/lib/lang/translate'
import { loadChar } from '@/lib/character'
import { dialogWidth } from '@/lib/width'
import SelectCharInstance from './SelectCharInstance.vue'

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

</script>

<template>
    <el-dialog v-model="ifShow" :title="t.action.selectChar" :width="dialogWidth" top="10vh"
               @open="loadChar('arknights');selector.autoFocus()"
               @closed="selector.search=''">
        <SelectCharInstance max-height="60vh" ref="selector" @select="(v) => {$emit('select',v);ifShow=false}"/>
    </el-dialog>
</template>
