import { ref, computed } from 'vue'
import WindowResize from '@/lib/utils/windowResize'
import { defaultWindowWidth } from '@/lib/data/constance'
import type { Ref } from 'vue'

const windowWidth:Ref<number> = ref(Math.min(defaultWindowWidth, window.innerWidth))
WindowResize.on(() => {
    windowWidth.value = Math.min(defaultWindowWidth, window.innerWidth)
})
const dialogWidth = computed(() => {
    return Math.floor(windowWidth.value * 0.9)
})

export {
    dialogWidth,
    windowWidth
}
