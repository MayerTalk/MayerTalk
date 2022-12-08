import {defineAsyncComponent} from 'vue'

const Arknights = defineAsyncComponent(() => import('./arknights/Render.vue'));

export default {
    Arknights
}