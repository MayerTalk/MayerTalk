<script setup>
    import {ref, inject, computed, onMounted} from 'vue'

    const chars = inject('chars');
    const images = inject('images');
    const staticUrl = inject('staticUrl');
    const props = defineProps([
        'modelValue',
        'elCharSelector',
        'narration',
    ]);
    const emit = defineEmits([
        'update:modelValue',
        'update:elCharSelector',
        'showGuide',
    ]);

    const elCharSelector = ref(null);

    const modelValue = computed({
        get() {
            return props.modelValue
        },
        set(value) {
            emit('update:modelValue', value);
        }
    });

    onMounted(() => {
        emit("update:elCharSelector", elCharSelector.value);
    });

</script>

<template>
    <el-select ref="elCharSelector" v-model="modelValue" style="flex-grow: 1;width:100%" placeholder="角色" filterable>
        <el-option
                v-for="(char, id) in chars"
                :key="id"
                :label="char.name"
                :value="id"
        >
            {{char.name}}
            <div style="display: flex; align-items: center; height: 100%; float: right">
                <img :src="images[char.avatar] || staticUrl + char.avatar"
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