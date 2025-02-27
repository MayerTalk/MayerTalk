<script setup lang="ts">
import { useTemplateRef, onUnmounted } from 'vue'
import { t } from '@/lib/lang/translate'
import { chars, avatars } from '@/lib/data/data'
import { closeShowHook } from '@/lib/data/showControl'
import { ElSelect } from 'element-plus';
import { ensureValue } from '@/lib/utils/tool';

const modelValue = defineModel<string | Array<string>>({ required: true })
const select = useTemplateRef<InstanceType<typeof ElSelect>>('select')
const multiple = Array.isArray(modelValue.value)

const { narration = false, placeholder = '' } = defineProps<{
    narration?: boolean, // 是否展示旁白
    placeholder?: string,
}>()

onUnmounted(closeShowHook.on(() => {
    if (modelValue.value) {
        modelValue.value = ''
    }
}))

function focus() {
    ensureValue(select.value, 'select').focus()
}

function blur() {
    ensureValue(select.value, 'select').blur()
}

defineExpose({ focus, blur })
</script>

<template>
    <el-select v-model="modelValue" ref="select" style="flex-grow: 1;"
        :placeholder="narration ? t.noun.narration : placeholder || t.noun.character" :multiple="multiple" filterable>
        <el-option v-for="(char, id) in chars" :key="id" :label="char.name" :value="id">
            {{ char.name }}
            <div style="display: flex; align-items: center; height: 100%; float: right">
                <img :src="(avatars[id] as unknown as string)" style="height: 80%; display: inline" />
            </div>
        </el-option>
        <el-option v-if="narration" key="" :label="t.noun.narration" value="" />
    </el-select>
</template>
