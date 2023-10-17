import { defineAsyncComponent } from 'vue'

const Siracusa = defineAsyncComponent(() => import('./Siracusa/MainRenderer.vue'))

export default {
    Siracusa
}
