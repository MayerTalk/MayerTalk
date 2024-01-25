<script setup>
import { editorSettings, setEditorSettings } from '@/lib/data/settings'
import { t } from '@/lib/lang/translate'
</script>

<template>
    <table>
        <tr>
            <th>{{ t.noun.characterSelectorPermanent }}<span
                style="color:grey;"><br/>({{ t.tip.settings.characterSelectorPermanent }})</span></th>
            <td>
                <el-switch :model-value="editorSettings.characterSelectorPermanent" style="margin-left: 10px"
                           @update:model-value="(v) => {setEditorSettings('characterSelectorPermanent',v,(v) => {return !v})}"</el-switch>
            </td>
        </tr>
    </table>
</template>

<style scoped src="@/style/settings.css"/>
