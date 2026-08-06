<script setup lang="ts">
import { ref } from 'vue'
import type { UploadRawFile } from 'element-plus'

import message from '@/lib/utils/message'
import Save from '@/lib/function/savefile'
import { t, updateTranslation } from '@/lib/lang/translate'
import { ensureMessage, formatSize, clickBySelector } from '@/lib/utils/tool'
import { SUPPORT_LANG, LANG_DICT, type SupportLangKey } from '@/lib/lang/constant'

import { dialogWidth } from '@/lib/data/width'
import { mainShow } from '@/lib/data/showControl'
import { config, DataControl } from '@/lib/data/data'
import { currEditorRef, currRendererRef } from '@/lib/data/state'
import { downloadData, uploadData } from '@/lib/data/versionControl'
import { DEFAULT_GENERIC_SETTINGS, genericSettings } from '@/lib/data/settings'

import Editors from '@/editor'
import Renderers from '@/renderer'
import SettingsNumberInput from '@/components/Settings/SettingsNumberInput.vue';


const storageSize = ref(t.value.notify.calculating + '...')
const editorKeys = Object.keys(Editors) as Array<keyof typeof Editors>
const rendererKeys = Object.keys(Renderers) as Array<keyof typeof Renderers>

function getStorageSize() {
    let size = 0
    for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
            const obj = localStorage.getItem(key)
            if (obj) {
                size += obj.length
            }
        }
    }
    size += DataControl.images.lastSave.length
    Save.getInfo((data) => {
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                size += data[key].size
            }
        }
        storageSize.value = formatSize(size)
    })
}

function clearStorage() {
    DataControl.reset()
    message.notify(t.value.notify.clearedSuccessfullyAndReloading, message.success)
    setTimeout(() => {
        location.reload()
    }, 500)
}

</script>

<template>
    <el-dialog v-model="mainShow.settings.value" :title="t.noun.settings" :width="dialogWidth"
        @closed="DataControl.save(['config', 'settings'])" @open="getStorageSize">
        <div id="settings">
            <!--Generic Settings-->
            <div style="display: flex; align-items: center">
                <div class="line-left" style="width: 20px;"></div>
                <h2 style="margin: 10px 0">{{ t.noun.common }}</h2>
                <div class="line-right"></div>
            </div>
            <table>
                <tbody>
                    <tr class="tr">
                        <th>{{ t.noun.editor }}</th>
                        <td>
                            <el-select v-model="config.editor">
                                <el-option v-for="key in editorKeys" :key="key" :value="key"
                                    :label="t.name.editor[key]" />
                            </el-select>
                        </td>
                    </tr>
                    <tr>
                        <th>{{ t.noun.renderer }}</th>
                        <td>
                            <el-select v-model="config.renderer">
                                <el-option v-for="key in rendererKeys" :key="key" :value="key"
                                    :label="t.name.renderer[key]" />
                            </el-select>
                        </td>
                    </tr>
                    <tr>
                        <th>{{ t.noun.language }}</th>
                        <td>
                            <el-select v-model="config.lang"
                                @change="(lang: SupportLangKey) => updateTranslation(lang)">
                                <el-option v-for="lang in SUPPORT_LANG" :key="lang" :value="lang"
                                    :label="LANG_DICT[lang]" />
                            </el-select>
                        </td>
                    </tr>
                    <tr>
                        <th>{{ t.noun.imageQuality }}</th>
                        <td>
                            <SettingsNumberInput v-model="genericSettings.imageQuality"
                                :default-value="DEFAULT_GENERIC_SETTINGS.imageQuality" />
                        </td>
                    </tr>
                    <tr>
                        <th>{{ t.noun.dialogWidth }}<span style="color:grey;"><br />({{ t.tip.settings.dialogWidth
                        }})</span>
                        </th>
                        <td>
                            <SettingsNumberInput v-model="genericSettings.width"
                                :default-value="DEFAULT_GENERIC_SETTINGS.width" />
                        </td>
                    </tr>
                </tbody>
            </table>
            <!--Editor Settings-->
            <template v-if="currEditorRef">
                <div style="display: flex; align-items: center">
                    <div class="line-left" style="width: 20px;"></div>
                    <h2 style="margin: 10px 0">{{ t.noun.editor }}</h2>
                    <div class="line-right"></div>
                </div>
                <component :is="currEditorRef.SettingsDialog" />
            </template>
            <!--Renderer Settings-->
            <template v-if="currRendererRef">
                <div style="display: flex; align-items: center">
                    <div class="line-left" style="width: 20px;"></div>
                    <h2 style="margin: 10px 0">{{ t.noun.renderer }}</h2>
                    <div class="line-right"></div>
                </div>
                <component :is="currRendererRef.SettingsDialog" />
            </template>
            <div style="display: flex; align-items: center">
                <div class="line-left" style="width: 20px;"></div>
                <h2 style="margin: 10px 0">{{ t.noun.storage }}</h2>
                <div class="line-right"></div>
            </div>
            <!--Storage-->
            <div style="margin: 5px 0 10px 10px">
                <el-button @click="downloadData" style="margin: 0 0 5px 10px">
                    <el-icon color="grey" :size="20">
                        <IconDownload />
                    </el-icon>
                    {{ t.action.export }}
                </el-button>
                <el-button @click="clickBySelector('#uploadData > div > input')" style="margin: 0 0 5px 10px">
                    <el-icon color="grey" :size="20">
                        <IconUpload />
                    </el-icon>
                    {{ t.action.import }}
                    <el-upload id="uploadData" action="#" :show-file-list="false" accept="application/json"
                        :before-upload="(file: UploadRawFile) => uploadData(file, () => { mainShow.settings.value = false })"
                        style="position: absolute" hidden>
                    </el-upload>
                </el-button>
                <el-button @click="() => { mainShow.settings.value = false; mainShow.savefile.value = true }"
                    style="margin: 0 0 5px 10px">
                    <el-icon color="grey" :size="20">
                        <IconCollection />
                    </el-icon>
                    {{ t.noun.savefile }}
                </el-button>
            </div>
            <table>
                <tbody>
                    <tr>
                        <th>{{ t.noun.local }}</th>
                        <td>{{ storageSize }}</td>
                        <td>
                            <el-button @click="ensureMessage(clearStorage, t.tip.emptyData)">{{ t.action.reset }}
                            </el-button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </el-dialog>

</template>

<style scoped src="@/style/settings.css" />
