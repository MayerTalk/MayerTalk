<script setup>
import { computed, ref } from 'vue'
import { DataControl } from '@/lib/data/data'
import { rendererSettings, rawRendererSettings, setRendererSettings } from '@/lib/data/settings'
import { t } from '@/lib/lang/translate'
import { dialogWidth } from '@/lib/data/width'
import { setKeyFalseDelete } from '@/lib/utils/tool'
import { currRendererRef } from '@/lib/data/stats'

const defaultSettings = computed(() => currRendererRef.value.defaultSettings)

const ifShowEditShowCharName = ref(false)
const showCharNameSettings = computed(() => {
    return rendererSettings.value.showCharNameSettings || {}
})

function setShowCharNameSettings (type, value) {
    if (!Object.prototype.hasOwnProperty.call(rawRendererSettings.value, 'showCharNameSettings')) {
        rawRendererSettings.value.showCharNameSettings = {}
    }
    setKeyFalseDelete(rawRendererSettings.value.showCharNameSettings, type, value, () => (defaultSettings.value.showCharNameSettings[type] || false) !== value)
    if (Object.keys(rawRendererSettings.value.showCharNameSettings).length === 0) {
        delete rawRendererSettings.value.showCharNameSettings
    }
}
</script>

<template>
    <table>
        <tr>
            <th>{{ t.noun.background }}</th>
            <td>
                <el-input :model-value="rawRendererSettings.background" :clearable="true"
                          @update:model-value="(v) => setRendererSettings('background',v)"
                          :placeholder="defaultSettings.background"/>
            </td>
        </tr>
        <tr>
            <th>{{ t.noun.showCharacterName }}</th>
            <td>
                <div style="display: flex; align-items: center">
                    <el-switch :model-value="rendererSettings.showCharName"
                               @update:model-value="(v) => setRendererSettings('showCharName',v)"/>
                    <el-icon :size="35" color="#707070" style="margin-left: 10px; cursor: pointer"
                             @click="ifShowEditShowCharName=true">
                        <IconOperation/>
                    </el-icon>
                </div>
            </td>
        </tr>
    </table>
    <el-dialog v-model="ifShowEditShowCharName" :title="t.action.pleaseSelectTypeOfCharacterToShow" :width="dialogWidth"
               @closed="DataControl.save('settings')">
        <table>
            <tr v-for="(text, type) in t.name.typeDict" :key="type">
                <th>{{ text }}</th>
                <td>
                    <el-switch :model-value="showCharNameSettings[type]"
                               @update:model-value="(value) => {setShowCharNameSettings(type,value)}"
                               style="margin-left: 10px"/>
                </td>
            </tr>
        </table>
    </el-dialog>
</template>

<style scoped>

</style>
