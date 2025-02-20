<script setup>
import { editorSettings } from '@/editor/Default'
import { t } from '@/lib/lang/translate'
</script>

<template>
    <table>
        <tbody>
        <tr>
            <th>{{ t.noun.characterSelectorPermanent }}<span
                style="color:grey;"><br/>({{ t.tip.settings.characterSelectorPermanent }})</span></th>
            <td>
                <el-switch v-model="editorSettings.characterSelectorPermanent" style="margin-left: 10px"/>
            </td>
        </tr>
        </tbody>
    </table>
</template>

<style scoped src="@/style/settings.css"/>
