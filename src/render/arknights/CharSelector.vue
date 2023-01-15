<script setup>
    import {ref, inject, computed, onMounted} from 'vue'
    import {chars, avatars} from '@/data'

    const props = defineProps({
        modelValue: null,
        narration: Boolean,
        select: null,
        placeholder: {
            type: String,
            default: '角色'
        }
    });
    const emit = defineEmits([
        'update:modelValue',
        'update:select',
        'onMounted',
        'showGuide',
    ]);

    const select = ref(null);

    const modelValue = computed({
        get() {
            return props.modelValue
        },
        set(value) {
            emit('update:modelValue', value);
        }
    });

    onMounted(() => {
        emit("update:select", select.value);
    });

</script>

<template>
    <el-select
            v-model="modelValue"
            ref="select"
            style="flex-grow: 1;"
            :placeholder="props.placeholder"
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
                   label="旁白"
                   value=""
        />
    </el-select>
</template>