<script setup>
import { ref } from 'vue'
import { uploadData } from '@/lib/versionControl'

const ifShow = ref(false)

function loga (event) {
    event.preventDefault()
    if (event.type === 'drop') {
        uploadData(event.dataTransfer.files[0])
        ifShow.value = false
    } else if (event.type === 'dragenter') {
        ifShow.value = true
    }
}

document.body.addEventListener('dragenter', loga)
document.body.addEventListener('drop', loga)
document.body.addEventListener('dragover', loga)

</script>

<template>
    <teleport to="#app">
        <div v-if="ifShow" class="container">
            <h2>导入文件</h2>
        </div>
    </teleport>
</template>

<style scoped>
.container {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 10;
    opacity: 0.5;
    background: white;
    color: grey;
    pointer-events: none;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
