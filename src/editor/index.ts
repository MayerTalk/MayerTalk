import { defineAsyncComponent } from 'vue'

const Default = defineAsyncComponent(() => import('./Default/MainEditor.vue'))

export default {
    Default
}
