import { ref } from 'vue'
import { mobileView } from '@/editor/Default/lib/width'

const defaultShow = {
    sidebar: ref(!mobileView.value),
    copy: ref(false)
}

export {
    defaultShow
}
