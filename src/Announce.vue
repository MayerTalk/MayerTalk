<script setup>
    import {onMounted} from 'vue'
    import {saveData, getData} from './lib/tool';

    const {modelValue} = defineProps(['modelValue']);
    const emit = defineEmits(['update:modelValue']);

    const version = 'v0.0.3';
    const dialogWidth = Math.ceil(Math.min(document.body.clientWidth, 1000) * 0.9);

    onMounted(() => {
        if (getData('a_version') !== version) {
            emit('update:modelValue', true);
            saveData('a_version', version)
        }
    })
</script>

<template>
    <el-dialog v-model="modelValue" :title="'公告 '+version" :width="dialogWidth"
               @close="$emit('update:modelValue',false)">
        <div style="position:relative;">

            <h2>明日方舟对话编辑器(beta)</h2>
            <p>开发阶段，功能尚不完善，还请谅解</p>
            <p><b>所有内容均在本地生成，不会上传至服务器，不具备云端保存功能</b></p>
            <h3>
                v0.0.3
            </h3>
            - 新增自动保存<br/>
            - 新增一键清空<br/>
            - 支持导入导出<br/>
            - <i>以上两项功能都在侧边栏中</i><br/>
            - <i>自动保存需要图片总大小在4MB内，导入导出无此限制</i>
            <p>
                <el-link href="/guide.mp4" type="primary">一个简陋的视频教程</el-link>
            </p>
            <el-link href="https://jq.qq.com/?_wv=1027&k=ImatbCzG" type="primary">交流群：560295639</el-link>
            <div style="position: absolute; bottom: 0; right: 0; color: #EEEEEE">咕咕</div>
        </div>
    </el-dialog>
</template>