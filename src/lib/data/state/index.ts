import { ref, computed, type Ref } from 'vue'

import Hook from '@/lib/utils/hook'

import { partialScreenshotViewMode } from '@/components/PartialScreenshot/partialScreenshotControl'

// TODO use defineComponent
import EditorInstance from './EditorInstance.vue';
import RendererInstance from './RendererInstance.vue';

const currEditorRef = ref<InstanceType<typeof EditorInstance> | null>(null)
const currRendererRef = ref<InstanceType<typeof RendererInstance> | null>(null)
const selectMode = computed(() => {
    return partialScreenshotViewMode.value
})
const ModeChange = new Hook<{
    target: Ref<boolean>,
    height: number
}>()
const duringScreenshot = ref(false)

export {
    currEditorRef,
    currRendererRef,
    selectMode,
    ModeChange,
    duringScreenshot
}
