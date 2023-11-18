<script setup>
import { ref, inject, computed } from 'vue'
import { t, updateTranslation } from '@/lib/lang/translate'
import { supportLang, langShow } from '@/lib/lang/constant'
import Editors from '@/editor'
import Renderers from '@/renderer'
import message from '@/lib/message'
import { ensure, formatSize, clickBySelector } from '@/lib/tool'
import Save from '@/lib/savefile'
import { downloadData, uploadData } from '@/lib/versionControl'

import { dialogWidth } from '@/lib/constance'
import {
    config,
    settings,
    DataControl
} from '@/lib/data'
import { syncedSettings, defaultSettings } from '@/lib/settings'

const emit = defineEmits(['resizeWindow', 'showSavefile'])

const ifShow = inject('ifShowSettings')

const ifShowEditShowCharName = ref(false)
const showCharNameSettings = computed(() => {
    return syncedSettings.value.showCharNameSettings || {}
})

function setShowCharNameSettings (type, value) {
    if (!Object.prototype.hasOwnProperty.call(settings.value, 'showCharNameSettings')) {
        settings.value.showCharNameSettings = {}
    }
    settings.value.showCharNameSettings[type] = value
}

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
    DataControl.clear(2)
    message.notify(t.value.notify.clearedSuccessfullyAndReloading, message.success)
    setTimeout(() => {
        location.reload()
    }, 500)
}

function checkClose (fn, ignore = []) {
    if (Object.prototype.hasOwnProperty.call(settings.value, 'maxHeight') &&
        settings.value.maxHeight < 1000 && settings.value.maxHeight !== 0 &&
        ignore.indexOf(1) === -1) {
        message.confirm(t.value.tip.cutScreenshot, t.value.noun.hint, () => {
            checkClose(fn, [...ignore, 1])
        })
    } else {
        fn()
    }
}
</script>

<template>
    <el-dialog v-model="ifShow" :title="t.noun.settings" :width="dialogWidth"
               :before-close="checkClose"
               @closed="DataControl.save(['config','settings'])" @open="getStorageSize">
        <div id="settings">
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
            </table>
            <div style="display: flex; align-items: center">
                <div class="line-left" style="width: 20px;"></div>
                <h2 style="margin: 10px 0">{{ t.noun.renderer }}</h2>
                <div class="line-right"></div>
            </div>
            <table>
                <tr>
                    <th>{{ t.noun.background }}</th>
                    <td>
                        <el-input v-model="settings.background" :clearable="true"
                                  :placeholder="'' + defaultSettings.background"/>
                    </td>
                </tr>
                <tr>
                    <th>{{ t.noun.dialogWidth }}<span style="color:grey;"><br/>({{ t.tip.settings.dialogWidth }})</span>
                    </th>
                    <td>
                        <el-input v-model="settings.width" :clearable="true"
                                  type="number"
                                  :placeholder="'' + defaultSettings.width"
                                  @input="(v) => {if(v){settings.width= +v}else{delete settings.width}}"/>
                    </td>
                </tr>
                <tr>
                    <th>{{ t.noun.imageQuality }}</th>
                    <td>
                        <el-input v-model="settings.scale" :clearable="true"
                                  type="number"
                                  :placeholder="'' + defaultSettings.scale"
                                  @input="(v) => {if(v){settings.scale= +v}else{delete settings.scale}}"/>
                    </td>
                </tr>
                <tr>
                    <th>{{ t.noun.screenshotMaxHeight }}</th>
                    <td style="display: flex">
                        <el-switch v-model="syncedSettings.autoCut" style="margin-right: 10px"
                                   @change="(value) => {settings.autoCut=value}"></el-switch>
                        <el-input v-model="settings.maxHeight" :clearable="true"
                                  type="number" :disabled="!syncedSettings.autoCut"
                                  :placeholder="'' + defaultSettings.maxHeight"
                                  @input="(v) => {if(v){settings.maxHeight= +v}else{delete settings.maxHeight}}"/>
                    </td>
                </tr>
                <tr>
                    <th>{{ t.noun.showCharacterName }}</th>
                    <td>
                        <div style="display: flex; align-items: center">
                            <el-switch
                                v-model="settings.showCharName"
                                style="--el-switch-on-color: #79bbff;">
                            </el-switch>
                            <el-icon :size="35" color="#707070" style="margin-left: 10px; cursor: pointer"
                                     @click="ifShowEditShowCharName=true">
                                <IconOperation/>
                            </el-icon>
                        </div>
                    </td>
                </tr>
            </table>
            <div style="display: flex; align-items: center">
                <div class="line-left" style="width: 20px;"></div>
                <h2 style="margin: 10px 0">{{ t.noun.storage }}</h2>
                <div class="line-right"></div>
            </div>
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
                        :before-upload="(file) => uploadData(file, () => {emit('resizeWindow'); ifShow=false})"
                        style="position: absolute" hidden
                    >
                    </el-upload>
                </el-button>
                <el-button @click="() => {ifShow=false; $emit('showSavefile')}" style="margin: 0 0 5px 10px">
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
                        <el-button @click="ensure(clearStorage,t.tip.emptyData)">{{ t.action.empty }}
                        </el-button>
                    </td>
                </tr>
            </table>
        </div>
    </el-dialog>
    <el-dialog v-model="ifShowEditShowCharName" :title="t.action.pleaseSelectTypeOfCharacterToShow" :width="dialogWidth"
               @closed="DataControl.save('settings')">
        <table>
            <tr v-for="(text, type) in t.name.typeDict" :key="type">
                <th>{{ text }}</th>
                <td>
                    <el-switch
                        v-model="showCharNameSettings[type]"
                        style="--el-switch-on-color: #79bbff; margin-left: 10px"
                        @change="(value) => {setShowCharNameSettings(type,value)}"
                    >
                    </el-switch>
                </td>
            </tr>
        </table>

    </el-dialog>

</template>

<style scoped>
table {
    padding-left: 10px;
    border-spacing: 5px;
}

.line-left {
    margin-right: 10px;
    height: 0;
    border-top: lightgrey solid 1px;
}

.line-right {
    margin-left: 10px;
    flex-grow: 1;
    height: 0;
    border-top: lightgrey solid 1px;
}
</style>
