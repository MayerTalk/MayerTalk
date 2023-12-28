<script setup>
defineProps({
    active: {
        type: Boolean,
        default: false
    }
})

</script>

<template>
    <div style="width: 100%; display: flex; justify-content: center; ">
        <div class="main-part" :class="{active: active}">
            <div class="first-part"></div>
            <div class="second-part" style="left: 0; transform: rotate(30deg)"></div>
            <div class="second-part" style="right: 0; transform: rotate(-30deg)"></div>
        </div>
    </div>
</template>

<style scoped>
.main-part {
    width: calc(100% + 26px);
    flex-shrink: 0;
    height: 20px;
    position: relative;
    top: -13px;
    overflow: hidden;
}

.first-part {
    width: calc(100% - 34px);
    background: skyblue;
    height: 2px;
    left: 17px;
    position: absolute;
    bottom: 0;
}

.active .first-part {
    background: royalblue;
}

.second-part {
    width: 20px;
    background: skyblue;
    height: 2px;
    position: absolute;
    bottom: 4px;
}

.active .second-part {
    background: royalblue;
}
</style>
