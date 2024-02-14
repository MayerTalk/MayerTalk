import { ref, computed } from 'vue'
import { partialScreenshotViewMode } from '@/components/PartialScreenshot/partialScreenshotControl'
import Hook from '@/lib/utils/hook'

const currEditorRef = ref(null)
const currRendererRef = ref(null)
const selectMode = computed(() => {
    return partialScreenshotViewMode.value
})
const ModeChange = new Hook()
const duringScreenshot = ref(false)

export {
    currEditorRef,
    currRendererRef,
    selectMode,
    ModeChange,
    duringScreenshot
}
