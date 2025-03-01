<script setup lang="ts">
import { useTemplateRef, onUnmounted } from 'vue'
import { t } from '@/lib/lang/translate'
import { loadSeries } from '@/lib/data/character'
import { dialogWidth } from '@/lib/data/width'
import SelectCharInstance from './SelectCharInstance.vue'
import { closeShowHook } from '@/lib/data/showControl'
import { doAfterRefMounted } from '@/lib/utils/tool'


defineEmits<{
    select: [char: { avatar: string, name: string }]
}>()
const ifShow = defineModel<boolean>()
const selector = useTemplateRef<InstanceType<typeof SelectCharInstance>>('selector')


onUnmounted(closeShowHook.on(() => {
    if (ifShow.value) {
        ifShow.value = false
    }
}))

function autoFocus() {
    doAfterRefMounted(selector, (res) => {
        res.value.autoFocus()
    })
}

function afterClose() {
    if (selector.value) {
        selector.value.search = ''
    }
}

</script>

<template>
    <el-dialog v-model="ifShow" :title="t.action.selectCharacter" :width="dialogWidth" top="10vh"
        @open="loadSeries.arknights(); autoFocus()" @closed="afterClose">
        <SelectCharInstance max-height="60vh" ref="selector" @select="(v) => { $emit('select', v); ifShow = false }" />
    </el-dialog>
</template>
