import { defineAsyncComponent } from 'vue'

const Default = defineAsyncComponent(() => import('./Default/MainRender.vue'))

export default {
    Default
}
