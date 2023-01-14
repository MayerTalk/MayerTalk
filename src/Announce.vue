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

    const version = 'v0.0.5';
    const dialogWidth = Math.ceil(Math.min(document.body.clientWidth, 700) * 0.9);

    const isNewSite = location.href.indexOf('https://www.mayertalk.top/') === 0;

    onMounted(() => {
        if (getData('a_version') !== version) {
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
        <h3>
            v0.0.5
        </h3>
        - 支持 撤销/重做<br/>
        - 新增对话类型 选项/选择/标题<br/>
        - 新增渲染设置<br/>
        - 修复移动端元素溢出<br/>
        -
        <el-link href="https://www.mayertalk.top/" type="primary">
            {{isNewSite?'站点迁移 (您已在新站点)':'站点迁移 前往[https://www.mayertalk.top/]'}}
        </el-link>
        <h3>关于截图失败</h3>
        <b>iOS：待支持</b><br/>
        <b>安卓：推荐使用via</b><br/>
        <el-link @click="ifShowUnsupportBrowser=true" href="javascript:void(0)">查看不支持的浏览器</el-link>
        <br/>
        <el-link href="https://wj.qq.com/s2/11287516/2689/" type="primary">其他浏览器无法截图/导出反馈</el-link>
        <p>
            <el-link @click="$emit('showGuide', false)" href="javascript:void(0)">查看指南</el-link>
        </p>
        <el-link href="https://jq.qq.com/?_wv=1027&k=ImatbCzG" type="primary">交流群：560295639</el-link>
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