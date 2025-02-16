import { t } from '@/lib/lang/translate'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { ElMessageBoxOptions,MessageParams } from 'element-plus';

const message = {
    info: 'info',
    success: 'success',
    warning: 'warning',
    error: 'error',
    notify(text: string,
        type: string = message.info) {
        ElMessage(
            {
                type,
                message: text
            } as MessageParams
        )
    },
    confirm(text: string,
        title:string = t.value.noun.hint,
        confirm: () => void,
        cancel: () => void,
        type = message.warning) {
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
