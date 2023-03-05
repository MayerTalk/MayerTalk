import { defineAsyncComponent } from 'vue'

const Arknights = defineAsyncComponent(() => import('./arknights/MainRender.vue'))

export default {
    Arknights
}
