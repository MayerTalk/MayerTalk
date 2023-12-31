import { ref, computed } from 'vue'
import WindowResize from '@/lib/utils/windowResize'
import { defaultWindowWidth } from '@/lib/data/constance'

const windowWidth = ref(Math.min(defaultWindowWidth, window.innerWidth))
WindowResize.onResize(() => {
    windowWidth.value = Math.min(defaultWindowWidth, window.innerWidth)
})
const dialogWidth = computed(() => {
    return Math.floor(windowWidth.value * 0.9)
})

export {
    dialogWidth,
    windowWidth
}
