<script setup>
import { loadChar } from '@/lib/character'
import SelectCharInstance from '@/editor/Default/components/SelectCharInstance.vue'
import { ifShowPermanentSelectChar } from '@/editor/Default/lib/width'
import CollapseItem from '@/components/CollapseItem'

defineEmits(['select'])

loadChar('arknights')
</script>

<template>
    <CollapseItem row>
        <div v-if="ifShowPermanentSelectChar" class="container" id="permanent-select-char">
            <div class="mark-placeholder">
                <!-- mask & placeholder -->
            </div>
            <div class="sub-container">
                <SelectCharInstance @select="args => $emit('select',args)"/>
            </div>
        </div>
    </CollapseItem>
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
    opacity: 0.2;
    background: white;
}
</style>
