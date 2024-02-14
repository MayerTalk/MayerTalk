<script setup>
import { ref } from 'vue'
import { t, updateTranslation } from '@/lib/lang/translate'
import { supportLang, langShow } from '@/lib/lang/constant'
import Editors from '@/editor'
import Renderers from '@/renderer'
import message from '@/lib/utils/message'
import { ensure, formatSize, clickBySelector } from '@/lib/utils/tool'
import Save from '@/lib/function/savefile'
import { downloadData, uploadData } from '@/lib/data/versionControl'
import { mainShow } from '@/lib/data/showControl'
import { currEditorRef, currRendererRef } from '@/lib/data/state'

import {
    config,
    settings,
    DataControl
} from '@/lib/data/data'
import {
    setCommonSettings,
    defaultSettings
} from '@/lib/data/settings'
import { dialogWidth } from '@/lib/data/width'

const storageSize = ref(t.value.notify.calculating + '...')

function getStorageSize () {
    let size = 0
    for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
            size += localStorage.getItem(key).length
        }
    }
    size += DataControl.image.lastSave.length
    Save.getInfo((data) => {
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                size += data[key].size
            }
        }
        storageSize.value = formatSize(size)
    })
}

function clearStorage () {
    DataControl.reset()
    message.notify(t.value.notify.clearedSuccessfullyAndReloading, message.success)
    setTimeout(() => {
        location.reload()
    }, 500)
}

</script>

<template>
    <el-dialog v-model="mainShow.settings.value" :title="t.noun.settings" :width="dialogWidth"
               @closed="DataControl.save(['config','settings'])" @open="getStorageSize">
        <div id="settings">
            <!--Common Settings-->
            <div style="display: flex; align-items: center">
                <div class="line-left" style="width: 20px;"></div>
                <h2 style="margin: 10px 0">{{ t.noun.common }}</h2>
                <div class="line-right"></div>
            </div>
            <table>
                <tr class="tr">
                    <th>{{ t.noun.editor }}</th>
                    <td>
                        <el-select v-model="config.editor">
                            <el-option v-for="(renderer, key) in Editors" :key="key" :value="key"
                                       :label="t.name.editor[key]"/>
                        </el-select>
                    </td>
                </tr>
                <tr>
                    <th>{{ t.noun.renderer }}</th>
                    <td>
                        <el-select v-model="config.renderer">
                            <el-option v-for="(renderer, key) in Renderers" :key="key" :value="key"
                                       :label="t.name.renderer[key]"/>
                        </el-select>
                    </td>
                </tr>
                <tr>
                    <th>{{ t.noun.language }}</th>
                    <td>
                        <el-select v-model="config.lang" @change="(lang) => updateTranslation(lang)">
                            <el-option v-for="lang in supportLang" :key="lang" :value="lang" :label="langShow[lang]"/>
                        </el-select>
                    </td>
                </tr>
                <tr>
                    <th>{{ t.noun.imageQuality }}</th>
                    <td>
                        <el-input v-model="settings.common.imageQuality" :clearable="true"
                                  @change="(v) => {setCommonSettings('imageQuality',+v,(v) => v > 0)}"
                                  @clear="setCommonSettings('imageQuality',false)"
                                  :placeholder="'' + defaultSettings.imageQuality"/>
                    </td>
                </tr>
                <tr>
                    <th>{{ t.noun.dialogWidth }}<span style="color:grey;"><br/>({{ t.tip.settings.dialogWidth }})</span>
                    </th>
                    <td>
                        <el-input :model-value="settings.common.width" :clearable="true"
                                  @update:model-value="(v) => {{setCommonSettings('width',+v,(v) => v > 0)}}"
                                  :placeholder="'' + defaultSettings.width"/>
                    </td>
                </tr>
            </table>
            <!--Editor Settings-->
            <div style="display: flex; align-items: center">
                <div class="line-left" style="width: 20px;"></div>
                <h2 style="margin: 10px 0">{{ t.noun.editor }}</h2>
                <div class="line-right"></div>
            </div>
            <component :is="currEditorRef.SettingsDialog"/>
            <!--Renderer Settings-->
            <div style="display: flex; align-items: center">
                <div class="line-left" style="width: 20px;"></div>
                <h2 style="margin: 10px 0">{{ t.noun.renderer }}</h2>
                <div class="line-right"></div>
            </div>
            <component :is="currRendererRef.SettingsDialog"/>
            <div style="display: flex; align-items: center">
                <div class="line-left" style="width: 20px;"></div>
                <h2 style="margin: 10px 0">{{ t.noun.storage }}</h2>
                <div class="line-right"></div>
            </div>
            <!--Storage-->
            <div style="margin: 5px 0 10px 10px">
                <el-button @click="downloadData" style="margin: 0 0 5px 10px">
                    <el-icon color="grey" :size="20">
                        <IconDownload/>
                    </el-icon>
                    {{ t.action.export }}
                </el-button>
                <el-button @click="clickBySelector('#uploadData > div > input')" style="margin: 0 0 5px 10px">
                    <el-icon color="grey" :size="20">
                        <IconUpload/>
                    </el-icon>
                    {{ t.action.import }}
                    <el-upload
                        id="uploadData"
                        action="#"
                        :show-file-list="false"
                        accept="application/json"
                        :before-upload="(file) => uploadData(file, () => { mainShow.settings.value=false})"
                        style="position: absolute" hidden
                    >
                    </el-upload>
                </el-button>
                <el-button @click="() => {mainShow.settings.value=false;mainShow.savefile.value=true}"
                           style="margin: 0 0 5px 10px">
                    <el-icon color="grey" :size="20">
                        <IconCollection/>
                    </el-icon>
                    {{ t.noun.savefile }}
                </el-button>
            </div>

            <table>
                <tr>
                    <th>{{ t.noun.local }}</th>
                    <td>{{ storageSize }}</td>
                    <td>
                        <el-button @click="ensure(clearStorage,t.tip.emptyData)">{{ t.action.reset }}
                        </el-button>
                    </td>
                </tr>
            </table>
        </div>
    </el-dialog>

</template>

<style scoped src="@/style/settings.css"/>
