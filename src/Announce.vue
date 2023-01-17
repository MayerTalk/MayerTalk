<script setup>
    import {ref, computed, onMounted} from 'vue'
    import {saveData, getData} from './lib/tool';

    const props = defineProps(['modelValue']);
    const emit = defineEmits(['update:modelValue', 'showGuide']);

    const ifShowAnnouncement = computed({
        get() {
            return props.modelValue
        },
        set(value) {
            emit('update:modelValue', value);
        }
    });
    const ifShowUnsupportBrowser = ref(false);

    const version = 'v0.1.0';
    const dialogWidth = Math.ceil(Math.min(document.body.clientWidth, 700) * 0.9);

    const isNewSite = location.href.indexOf('https://www.mayertalk.top/') === 0;

    onMounted(() => {
        if (getData('a_version') !== version || !isNewSite) {
            emit('update:modelValue', true);
            saveData('a_version', version)
        }
    });
</script>

<template>
    <el-dialog v-model="ifShowAnnouncement" :title="'公告 ' + version" :width="dialogWidth">
        <h2 style="display: inline">MayerTalk(beta)</h2>
        <p>开发阶段，功能尚不完善，还请谅解</p>
        <p><b>所有内容均在本地生成，不会上传至服务器，不具备云端保存功能</b></p>
        <h2 style="color: orangered">祝各位博士新年快乐~</h2>
        <template v-if="isNewSite">
            <h3>
                v0.1.0
            </h3>
            <b>新增</b>
            <ul>
                <li>
                    <p style="display: flex; align-items: center; margin: 0">@提示
                        <el-link href="https://github.com/1MLightyears" target="_blank" style="margin-left: 5px">
                            @Lightyears
                        </el-link>
                    </p>
                </li>
                <li>
                    <p style="display: flex; align-items: center; margin: 0">+1
                        <el-link href="https://github.com/1MLightyears" target="_blank" style="margin-left: 5px">
                            @Lightyears
                        </el-link>
                    </p>
                </li>
                <li>
                    <p style="display: flex; align-items: center; margin: 0">显示角色名
                        <el-link href="https://github.com/1MLightyears" target="_blank" style="margin-left: 5px">
                            @Lightyears
                        </el-link>
                    </p>
                </li>
                <li>复读</li>
                <li>仅清空对话</li>
                <li>清空本地数据(设置)</li>
                <li>Ctrl + C 快捷创建角色</li>
            </ul>
            <b>修复</b>
            <ul>
                <li>长对话编辑时错误转跳</li>
            </ul>
            <b>优化</b>
            <ul>
                <li>角色栏由横向滚动改为纵向</li>
            </ul>
        </template>
        <template v-else>
            <h2>此网站将于1.30停止支持，请在完成现有创作后前往
                <el-link href="https://www.mayertalk.top/" type="primary" style="top: -2px; left: -4px"><h2
                        style="display: inline; margin: 0">新网站</h2></el-link>
            </h2>
        </template>
        <h3>关于截图失败</h3>
        <b>iOS：待支持</b><br/>
        <b>安卓：推荐使用via</b><br/>
        <el-link @click="ifShowUnsupportBrowser=true" href="javascript:void(0)">查看不支持的浏览器</el-link>
        <br/>
        <el-link href="https://wj.qq.com/s2/11287516/2689/" type="primary">其他浏览器无法截图/导出反馈</el-link>
        <p>
            <el-link @click="$emit('showGuide', false)" href="javascript:void(0)">查看指南</el-link>
        </p>
        <div style="display: flex">
            <el-link href="https://jq.qq.com/?_wv=1027&k=ImatbCzG" type="primary" style="margin-right: 5px">
                交流群：560295639
            </el-link>
            <span style="border-left: solid 1px darkgrey"></span>
            <el-link href="https://wj.qq.com/s2/11537223/aa61/" type="primary" style="margin-left: 5px;">bug反馈</el-link>
        </div>
        <div style="position: absolute; bottom: 0; right: 0; color: #EEEEEE">咕咕</div>
    </el-dialog>
    <el-dialog v-model="ifShowUnsupportBrowser" title="不支持的浏览器" :width="dialogWidth">
        <ul>
            <li>夸克</li>
            <li>UC</li>
            <li>QQ浏览器</li>
            <li>百度浏览器</li>
        </ul>
    </el-dialog>
</template>

<style scoped>
    ul {
        margin: 5px 0;
    }
</style>