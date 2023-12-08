<script setup>
import { ref, computed } from 'vue'
import { loadChar } from '@/lib/character'
import SelectCharInstance from '@/editor/Default/components/SelectCharInstance.vue'
import { ifShowPermanentSelectChar } from '@/editor/Default/lib/width'
import CollapseItem from '@/components/CollapseItem'

const localIfShow = ref(true)

const realIfShow = computed(() => {
    return localIfShow.value && ifShowPermanentSelectChar.value
})

defineEmits(['select'])

loadChar('arknights')
</script>

<template>
    <div style="position: relative">
        <CollapseItem row>
            <div v-show="realIfShow" class="container" id="permanent-select-char">
                <div class="mark-placeholder">
                    <!-- mask & placeholder -->
                </div>
                <div class="sub-container">
                    <SelectCharInstance @select="args => $emit('select',args)"/>
                </div>
            </div>
        </CollapseItem>
        <CollapseItem row>
            <div v-show="ifShowPermanentSelectChar" class="lever-container">
                <div class="lever-placeholder"></div>
                <div class="lever" @click="localIfShow=!localIfShow">
                    <el-icon color="lightgrey" :size="18">
                        <IconArrowRight :style="{transform: (realIfShow?'rotate(-180deg)':null)}"
                                        style="transition: all ease-in-out 0.6s"/>
                    </el-icon>
                </div>
            </div>
        </CollapseItem>
    </div>
</template>

<style scoped>
.container {
    height: 100%;
    flex-shrink: 0;
    border-right: grey solid 1px;
    position: relative;
    transition: all ease 0.6s;
}

.sub-container {
    padding: 10px;
    width: 400px;
    height: 100%;
    position: absolute;
    right: 0;
    top: 0;
}

.mark-placeholder {
    width: 420px;
    height: 100%;
    background: #606060;
}

.lever-placeholder {
    width: 22px;
    height: 56px;
    position: relative;
    top: 0;
    left: 0;
}

.lever-container {
    position: absolute;
    top: calc(50% - 28px);
    left: 100%;
    overflow: hidden;
}

.lever {
    position: absolute;
    cursor: pointer;
    overflow: hidden;
    top: 0;
    right: 0;
    height: calc(100% - 2px);
    width: 150%;
    background: #606060;
    transition: all ease 0.6s;
    border-radius: 33%;
    border: 1px grey solid;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    z-index: 1;
}
</style>
