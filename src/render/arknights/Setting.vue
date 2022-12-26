<script setup>
    import {ref, inject, watch, computed} from 'vue'
    import Renders from '@/render'

    const defaultSettings = {
        background: '#303030',
        width: 400,
        style: 'default',
        scale: 1.5
    };

    const DataControl = inject('DataControl');
    const ifShow = inject('ifShowSettings');
    const settings = inject('settings');
    const renderSettings = inject('renderSettings');
    const config = inject('config');
    const dialogWidth = inject('dialogWidth');

    // 显示角色名片
    const showAvatarName = inject('showAvatarName');

    function sync() {
        for (let key in defaultSettings) {
            if (defaultSettings.hasOwnProperty(key)) {
                renderSettings.value[key] = settings.value[key] || defaultSettings[key]
            }
        }
    }

    function numProxy(obj) {
        const r = ref(obj);
        watch(r, () => {
            obj.value = +r
        });
        return r
    }

    const width = numProxy(settings.value.width);

    const fake = ref({
        width: settings.value.width || null,
        scale: settings.value.scale || null
    });

    const language = ref('zh-cn');

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
                <tr>
                    <th>显示角色名片</th>
                    <td>
                        <el-switch
                                v-model="showAvatarName"
                                active-text="是"
                                inactive-text="否"
                                style="--el-switch-on-color: #a0cfff; --el-switch-off-color: #a0cfff">
                        </el-switch>
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
            </table>
        </div>
    </el-dialog>
</template>

<style>
    #settings .select-trigger {
        display: flex;
        justify-self: flex-end;
    }
</style>

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

    th {
        text-align: right;
    }
</style>