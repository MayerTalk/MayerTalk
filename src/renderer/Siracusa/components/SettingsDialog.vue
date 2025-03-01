<script setup lang="ts">
import { ref } from 'vue'
import { DataControl } from '@/lib/data/data'
import { t } from '@/lib/lang/translate'
import { dialogWidth } from '@/lib/data/width'
import { DEFAULT_RENDERER_SETTINGS,rendererSettings } from '@/renderer/Siracusa';
import SettingsTextInput from '@/components/Settings/SettingsTextInput.vue';

const ifShowEditShowCharName = ref(false)

</script>

<template>
    <table>
        <tbody>
        <tr>
            <th>{{ t.noun.background }}</th>
            <td>
                <SettingsTextInput v-model="rendererSettings.background" :default-value="DEFAULT_RENDERER_SETTINGS.background"/>
            </td>
        </tr>
        <tr>
            <th>{{ t.noun.showCharacterName }}</th>
            <td>
                <div style="display: flex; align-items: center">
                    <el-switch v-model="rendererSettings.showCharName"/>
                    <el-icon :size="35" color="#707070" style="margin-left: 10px; cursor: pointer"
                             @click="ifShowEditShowCharName=true">
                        <IconOperation/>
                    </el-icon>
                </div>
            </td>
        </tr>
        </tbody>
    </table>
    <el-dialog v-model="ifShowEditShowCharName" :title="t.notify.pleaseSelectTypeOfCharacterToShow" :width="dialogWidth"
               @closed="DataControl.save('settings')">
        <table>
            <tbody>
                <tr v-for="(text, type) in t.name.typeDict" :key="type">
                    <th>{{ text }}</th>
                    <td>
                        <el-switch v-model="rendererSettings.showCharNameSettings[type]"
                                   style="margin-left: 10px"/>
                    </td>
                </tr>
            </tbody>
        </table>
    </el-dialog>
</template>

<style scoped>

</style>
