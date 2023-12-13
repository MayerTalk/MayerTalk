import { ref } from 'vue'
import { chats, DataControl } from '@/lib/data/data'
import { copyDialogueHook, createDialogueHook } from '@/lib/function/dialogue'

const plus1 = ref(-1)

function plus1Hook (index) {
    if (index > 0) {
        const c1 = chats.value[index]
        const c2 = chats.value[index - 1]
        if (c1.content === c2.content && c1.type === c2.type) {
            plus1.value = index
        } else {
            plus1.value = -1
        }
    } else {
        plus1.value = -1
    }
}

createDialogueHook.push(() => {
    plus1Hook(chats.value.length - 1)
})

copyDialogueHook.push((index, data, config) => {
    if (Object.prototype.hasOwnProperty.call(config, 'save') ? config.save : true) {
        DataControl.save('chats')
        plus1Hook(chats.value.length - 1)
    }
})

export default plus1
