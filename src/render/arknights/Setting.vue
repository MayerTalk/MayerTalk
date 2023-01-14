<script setup>
    import {ref, inject, watch, computed} from 'vue'
    import Renders from '@/render'
    import message from '@/lib/message'
    import {ensure} from '@/lib/tool';

    import {TypeDict} from "@/constance";
    import {
        config,
        settings,
        DataControl
    } from '@/data'

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
        }
    };

    const ifShow = inject('ifShowSettings');
    const renderSettings = inject('renderSettings');
    const dialogWidth = inject('dialogWidth');

    function _sync(dst, src1, src2, k) {
        for (let key in src1) {
            if (src1.hasOwnProperty(key)) {
                if (typeof src1[key] === 'object') {
                    dst[key] = {};
                    _sync(dst[key], src1[key], src2[key] || {}, key)
                } else {
                    dst[key] = src1[key]
                }
            }
        }
        for (let key in src2) {
            if (src2.hasOwnProperty(key)) {
                if (typeof src2[key] !== 'object' && (src2[key] || typeof src2[key] === "boolean")) {
                    dst[key] = src2[key]
                }
            }
        }
    }

    function sync() {
        _sync(renderSettings.value, defaultSettings, settings.value);
    }


    const fake = ref({
        width: settings.value.width || null,
        scale: settings.value.scale || null
    });


    const language = ref('zh-cn');

    const ifShowEditShowCharName = ref(false);
    const showCharNameSettings = computed(() => {
        return renderSettings.value.showCharNameSettings || {}
    });

    function setShowCharNameSettings(type, value) {
        if (!settings.value.hasOwnProperty('showCharNameSettings')) {
            settings.value.showCharNameSettings = {}
        }
        settings.value.showCharNameSettings[type] = value
    }

    const SizeUnit = ['B', 'KB', 'MB'];

    function getStorageSize() {
        let size = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                size += localStorage.getItem(key).length
            }
        }
        let unit = SizeUnit[0];
        for (let i = 1; size > 1024; i++) {
            size /= 1024;
            unit = SizeUnit[1]
        }
        return size.toFixed(2) + unit;
    }

    function clearStorage() {
        localStorage.clear();
        message.notify('清空成功，正在重载', message.success);
        setTimeout(() => {
            location.reload()
        }, 500)
    }

    // 同步，否则加载延迟+++
    sync();
    watch(settings, () => sync(), {deep: true});
</script>

<template>
    <el-dialog v-model="ifShow" title="设置" :width="dialogWidth" @closed="DataControl.save(['config','settings'])">
        <div id="settings">
            <div style="display: flex; align-items: center">
                <div class="line-left" style="width: 20px;"></div>
                <h2 style="margin: 10px 0">通用</h2>
                <div class="line-right"></div>
            </div>
            <table>
                <tr class="tr">
                    <th>渲染器</th>
                    <td>
                        <el-select v-model="config.render">
                            <el-option v-for="(render, key) in Renders" :key="key" :value="key"/>
                        </el-select>
                    </td>
                </tr>
                <tr>
                    <th>语言</th>
                    <td>
                        <el-select v-model="language" style="">
                            <el-option key="zh-cn" value="zh-cn"/>
                        </el-select>
                    </td>
                </tr>
            </table>
            <div style="display: flex; align-items: center">
                <div class="line-left" style="width: 20px;"></div>
                <h2 style="margin: 10px 0">渲染</h2>
                <div class="line-right"></div>
            </div>
            <table>
                <tr>
                    <th>背景色</th>
                    <td>
                        <el-input v-model="settings.background" :clearable="true"
                                  :placeholder="'' + defaultSettings.background"/>
                    </td>
                </tr>
                <tr>
                    <th>对话框宽度<span style="color:grey;"><br/>（不包含头像）</span></th>
                    <td>
                        <el-input v-model="fake.width" :clearable="true"
                                  :placeholder="'' + defaultSettings.width"
                                  @input="settings.width=+fake.width"/>
                    </td>
                </tr>
                <tr>
                    <th>生成图缩放</th>
                    <td>
                        <el-input v-model="fake.scale" :clearable="true"
                                  :placeholder="'' + defaultSettings.scale"
                                  @input="settings.scale=+fake.scale"/>
                    </td>
                </tr>
                <tr>
                    <th>显示角色名</th>
                    <td>
                        <div style="display: flex; align-items: center">
                            <el-switch
                                    v-model="settings.showCharName"
                                    style="--el-switch-on-color: #79bbff;">
                            </el-switch>
                            <el-icon :size="35" color="#707070" style="margin-left: 10px; cursor: pointer"
                                     @click="ifShowEditShowCharName=true">
                                <Operation/>
                            </el-icon>
                        </div>
                    </td>
                </tr>
            </table>
            <div style="display: flex; align-items: center">
                <div class="line-left" style="width: 20px;"></div>
                <h2 style="margin: 10px 0">储存</h2>
                <div class="line-right"></div>
            </div>
            <table>
                <tr>
                    <th>本地</th>
                    <td>{{getStorageSize()}}</td>
                    <td>
                        <el-button @click="ensure(clearStorage,'即将清空所有数据（对话、角色、设置）')">清空</el-button>
                    </td>
                </tr>
            </table>
        </div>
    </el-dialog>
    <el-dialog v-model="ifShowEditShowCharName" title="请选择要显示角色名的类型" :width="dialogWidth"
               @closed="DataControl.save('settings')">
        <table>
            <tr v-for="(text, type) in TypeDict">
                <th>{{text}}</th>
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