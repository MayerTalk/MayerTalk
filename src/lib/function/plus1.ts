import { ref } from 'vue'
import { chats, DataControl } from '@/lib/data/data'
import { DialogueHook } from '@/lib/function/dialogue'

const plus1 = ref(-1)

function handlePlus1(index: number) {
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

DialogueHook.create.on(() => {
    handlePlus1(chats.value.length - 1)
})
DialogueHook.copy.on((params) => {
    if (Object.prototype.hasOwnProperty.call(params.config, 'save') ? params.config.save : true) {
        DataControl.save('chats')
        handlePlus1(chats.value.length - 1)
    }
})

export default plus1
