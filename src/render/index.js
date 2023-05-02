import { defineAsyncComponent } from 'vue'

const Siracusa = defineAsyncComponent(() => import('./Siracusa/MainRender.vue'))

export default {
    Siracusa
}
