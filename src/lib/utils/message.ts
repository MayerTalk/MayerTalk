import { t } from '@/lib/lang/translate'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { ElMessageBoxOptions, MessageParams, messageType } from 'element-plus';

const message = {
    info: 'info' as messageType,
    success: 'success' as messageType,
    warning: 'warning' as messageType,
    error: 'error' as messageType,
    notify(text: string,
        type: messageType = 'info') {
        ElMessage(
            {
                type,
                message: text
            } as MessageParams
        )
    },
    confirm(text: string,
        title: string = t.value.noun.hint,
        confirm?: () => void,
        cancel?: () => void,
        type: messageType = 'warning') {
        ElMessageBox
            .confirm(text, title,
                {
                    type,
                    confirmButtonText: t.value.action.confirm,
                    cancelButtonText: t.value.action.cancel
                } as ElMessageBoxOptions
            )
            .then(confirm || null)
            .catch(cancel || null)
    }
}

export default message
