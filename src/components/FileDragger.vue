<script setup lang="ts">
import { ref } from 'vue'
import { uploadData } from '@/lib/data/versionControl'
import { t } from '@/lib/lang/translate'

const ifShow = ref(false)
let dragStatus = false

function open () {
    dragStatus = true
    ifShow.value = true
}

function close () {
    if (dragStatus && ifShow.value) {
        dragStatus = false
        setTimeout(() => {
            if (!dragStatus) {
                dragStatus = false
                ifShow.value = false
            }
        }, 10)
    }
}

function handleEvent (event) {
    event.preventDefault()
    if (event.type === 'drop') {
        uploadData(event.dataTransfer.files[0])
        close()
    } else if (event.type === 'dragenter') {
        open()
    } else if (event.type === 'dragover') {
        dragStatus = true
    } else if (event.type === 'dragleave') {
        close()
    }
}

document.body.addEventListener('dragenter', handleEvent)
document.body.addEventListener('drop', handleEvent)
document.body.addEventListener('dragleave', handleEvent)
document.body.addEventListener('dragover', handleEvent)

</script>

<template>
    <teleport to="#app">
        <div v-show="ifShow" class="container">
            <h2>{{ t.action.importFile }}</h2>
        </div>
    </teleport>
</template>

<style scoped>
.container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 405;
    opacity: 0.5;
    background: white;
    color: grey;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
