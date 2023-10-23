<script setup>
import { ref, computed, onMounted } from 'vue'
import { t } from '@/lib/lang/translate'
import { chars, avatars } from '@/lib/data'

const props = defineProps({
    modelValue: null,
    narration: Boolean,
    select: null,
    placeholder: {
        type: String,
        default: null
    }
})
const emit = defineEmits([
    'update:modelValue',
    'update:select',
    'onMounted',
    'showGuide'
])

const selectRef = ref(null)

const modelValue = computed({
    get () {
        return props.modelValue
    },
    set (value) {
        t.value.noun.character += '1'
        emit('update:modelValue', value)
    }
})

onMounted(() => {
    emit('update:select', selectRef.value)
})

</script>

<template>
    <el-select
            v-model="modelValue"
            ref="selectRef"
            style="flex-grow: 1;"
            :placeholder="props.placeholder || t.noun.character"
            filterable>
        <el-option
                v-for="(char, id) in chars"
                :key="id"
                :label="char.name"
                :value="id"
        >
            {{char.name}}
            <div style="display: flex; align-items: center; height: 100%; float: right">
                <img :src="avatars[id]"
                     style="height: 80%; display: inline"/>
            </div>
        </el-option>
        <el-option v-if="props.narration"
                   key=""
                   :label="t.noun.narration"
                   value=""
        />
    </el-select>
</template>
