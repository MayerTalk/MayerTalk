<script setup>
import { ref, inject, watch, computed } from 'vue'
import { t } from '@/lib/lang/translate'
import { supportLang } from '@/lib/lang/constant'
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

const emit = defineEmits(['resizeWindow', 'showSavefile'])

const defaultSettings = {
    background: '#303030',
    width: 400,
    style: 'default',
    scale: 1.5,
    showCharName: false,
    showCharNameSettings: {
        chat: true,
        monologue: true,
        image: true
    },
    maxHeight: 10000
}

const ifShow = inject('ifShowSettings')
const rendererSettings = inject('rendererSettings')

function _sync (dst, src1, src2) {
    for (const key in src1) {
        if (Object.prototype.hasOwnProperty.call(src1, key)) {
            if (typeof src1[key] === 'object') {
                dst[key] = {}
                _sync(dst[key], src1[key], src2[key] || {}, key)
            } else {
                dst[key] = src1[key]
            }
        }
    }
    for (const key in src2) {
        if (Object.prototype.hasOwnProperty.call(src2, key)) {
            if (typeof src2[key] !== 'object' && (src2[key] || typeof src2[key] === 'boolean')) {
                dst[key] = src2[key]
            }
        }
    }
}

function sync () {
    _sync(rendererSettings.value, defaultSettings, settings.value)
}

const fake = ref({
    width: settings.value.width || null,
    scale: settings.value.scale || null,
    maxHeight: settings.value.maxHeight || null
})

const ifShowEditShowCharName = ref(false)
const showCharNameSettings = computed(() => {
    return rendererSettings.value.showCharNameSettings || {}
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

// 同步，否则加载延迟+++
sync()
watch(settings, () => sync(), { deep: true })
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
                        <el-select v-model="config.lang">
                            <el-option v-for="lang in supportLang" :key="lang" :value="lang" :label="lang"/>
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
                        <el-input v-model="fake.width" :clearable="true"
                                  :placeholder="'' + defaultSettings.width"
                                  @input="settings.width=+fake.width"/>
                    </td>
                </tr>
                <tr>
                    <th>{{ t.noun.imageQuality }}</th>
                    <td>
                        <el-input v-model="fake.scale" :clearable="true"
                                  :placeholder="'' + defaultSettings.scale"
                                  @input="settings.scale=+fake.scale"/>
                    </td>
                </tr>
                <tr>
                    <th>{{ t.noun.screenshotMaxHeight }}</th>
                    <td>
                        <el-input v-model="fake.maxHeight" :clearable="true"
                                  :placeholder="'' + defaultSettings.maxHeight"
                                  @input="settings.maxHeight=+fake.maxHeight"/>
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
                <el-button @click="downloadData">
                    <el-icon color="grey" :size="20">
                        <IconDownload/>
                    </el-icon>
                    {{ t.action.export }}
                </el-button>
                <el-button @click="clickBySelector('#uploadData > div > input')">
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
                <el-button @click="() => {ifShow=false; $emit('showSavefile')}">
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
