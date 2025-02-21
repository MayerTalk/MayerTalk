import { ref, computed } from 'vue'
import { partialScreenshotViewMode } from '@/components/PartialScreenshot/partialScreenshotControl'
import type { Ref } from 'vue'
import Hook from '@/lib/utils/hook'

import RendererInstance from './RendererInstance.vue';
import EditorInstance from './EditorInstance.vue';

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
