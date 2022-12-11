<script setup>
    import {onMounted, computed} from 'vue'
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

    const version = 'v0.0.5';
    const dialogWidth = Math.ceil(Math.min(document.body.clientWidth, 1000) * 0.9);

    onMounted(() => {
        if (getData('a_version') !== version) {
            emit('update:modelValue', true);
            saveData('a_version', version)
        }
    })
</script>

<template>
    <el-dialog v-model="ifShowAnnouncement" :title="'公告 '+version" :width="dialogWidth">
        <div style="position:relative;">
            <h2 style="display: inline">明日方舟对话编辑器(beta)</h2>
            <p>开发阶段，功能尚不完善，还请谅解</p>
            <p><b>所有内容均在本地生成，不会上传至服务器，不具备云端保存功能</b></p>
            <h3>
                v0.0.5
            </h3>
            - 支持 撤销/重做<br/>
            - 新增对话类型 选项/选择/标题<br/>
            - 新增渲染设置<br/>
            - 修复移动端元素溢出<br/>
            - <el-link href="https://www.mayertalk.top/" type="primary">站点迁移</el-link>
            <h3>关于截图失败</h3>
            <b>iOS：待支持</b><br/>
            <b>安卓：请使用Edge/Chrome，不支持夸克/UC</b><br/>
            <el-link href="https://wj.qq.com/s2/11287516/2689/" type="primary">其他浏览器无法截图/导出反馈</el-link>
            <p>
                <el-link @click="$emit('showGuide', false)" href="" type="primary">查看指南</el-link>
            </p>
            <el-link href="https://jq.qq.com/?_wv=1027&k=ImatbCzG" type="primary">交流群：560295639</el-link>
            <div style="position: absolute; bottom: 0; right: 0; color: #EEEEEE">咕咕</div>
        </div>
    </el-dialog>
</template>