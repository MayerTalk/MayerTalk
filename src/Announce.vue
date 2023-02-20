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

    const version = 'v0.1.3';
    const dialogWidth = Math.ceil(Math.min(document.body.clientWidth, 700) * 0.9);

    onMounted(() => {
        if (getData('a_version') !== version) {
            emit('update:modelValue', true);
            saveData('a_version', version)
        } else if (invalidBrowser) {
            emit('update:modelValue', true);
        }
    });

    const invalidBrowser = navigator.userAgent.indexOf('UCBrowser') !== -1
        || navigator.userAgent.indexOf('Quark') !== -1
        || navigator.userAgent.indexOf('QQBrowser') !== -1
        || navigator.userAgent.indexOf('baidu') !== -1;
</script>

<template>
    <el-dialog v-model="ifShowAnnouncement" :title="'公告 ' + version" :width="dialogWidth">
        <h2 style="display: inline">MayerTalk(beta)</h2>
        <p>开发阶段，功能尚不完善，还请谅解</p>
        <template v-if="invalidBrowser">
            <h2 style="color: red">
                您当前使用的浏览器无法导出截图，请使用其他浏览器
            </h2>
            <h3>Q：为什么？</h3>
            <h3>A：您当前使用的浏览不支持blob，而为了在本地导出截图，blob是必须的</h3>
            <h3>Q：什么浏览器支持blob？</h3>
            <h3>A：推荐Edge/Chrome</h3>
        </template>
        <template v-else>
            <p><b>所有内容均在本地生成，不会上传至服务器，不具备云端保存功能</b></p>
            <el-link href="/docs/guide/start.html" type="primary">快速上手 (首次使用推荐阅读)</el-link>
            <h3>
                v0.1.3
            </h3>
            <b>新增</b>
            <ul>
                <li>
                    支持别名搜索<br/>
                    e.g. 现在可以用“刁民”搜索“乌萨斯平民”了<br/>
                    <p style="display: flex; margin: 0">没有想要的别名？
                        <el-link href="https://alias.arkfans.top/docs/alias.html" type="primary"
                                 style="margin-left: 5px;"
                                 target="_blank">
                            点我提交
                        </el-link>
                    </p>
                </li>
            </ul>
            <h3>关于截图失败</h3>

            <b>iOS：待支持</b><br/>
            <b>安卓：推荐使用via</b><br/>
            <el-link @click="ifShowUnsupportBrowser=true" href="javascript:void(0)">查看不支持的浏览器</el-link>
            <br/>
            <el-link href="https://wj.qq.com/s2/11287516/2689/" type="primary">其他浏览器无法截图/导出反馈</el-link>
        </template>
        <div style="display: flex; margin-top: 10px">
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