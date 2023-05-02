<script setup>
import { ref, computed } from 'vue'
import { StaticUrl, dialogWidth } from '@/lib/constance'
import { searchCharHandler, searchResult, loadChar } from '@/lib/character'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue', 'select'])

const ifShow = computed({
    get () {
        return props.modelValue
    },
    set (value) {
        emit('update:modelValue', value)
    }
})

const search = ref('')
const avatarBarFrameWidth = Math.floor((dialogWidth - 48) / 4) + 'px'

function initSearchChar () {
    const el = document.querySelector('#searchCharInput')
    el.addEventListener('input', () => {
        searchCharHandler(el.value)
    })
    searchCharHandler('')
}
</script>

<template>
    <el-dialog v-model="ifShow" title="选择角色" :width="dialogWidth" top="10vh"
               @open="loadChar('arknights');initSearchChar()"
               @closed="searchCharHandler('');search=''">
        <!--        素材库选择角色-->
        <el-input placeholder="搜索更多角色" v-model="search" id="searchCharInput"></el-input>
        <template v-if="searchResult">
            <el-scrollbar max-height="50vh" style="width: 100%">
                <div class="avatar-bar">
                    <div class="frame" v-for="char in searchResult" :key="char[0]"
                         :style="{width: avatarBarFrameWidth, height: avatarBarFrameWidth}">
                        <img :src="StaticUrl + char[1]" loading="lazy" :title="char[2]"
                             @click="() => {$emit('select',char);ifShow=false}">
                    </div>
                </div>
            </el-scrollbar>
        </template>
        <div v-else
             style="height: 150px; display: flex; justify-content: center; align-items: center; flex-flow: column;color: grey">
            <p>No Result</p>
            <p>Tips: 素材库仅包含干员/敌人/召唤物/装置</p>
        </div>
    </el-dialog>
</template>

<style scoped>
.avatar-bar {
    margin-top: 10px;
    display: flex;
    flex-wrap: wrap;
    --witdh: calc(25% - 2px);
}

.avatar-bar .frame {
    margin: 1px;
}

.avatar-bar img {
    width: 100%;
    height: 100%;
}

.avatar-bar img:hover {
    width: calc(100% - 2px);
    height: calc(100% - 2px);;
    border: grey solid 1px;
}
</style>
<style>
/*why not work?*/
/*.avatar-bar .frame {*/
/*    width: v-bind('avatarBarFrameWidth');*/
/*    height: v-bind('avatarBarFrameWidth');*/
/*}*/
</style>
