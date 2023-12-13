import { t } from '@/lib/lang/translate'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
    info: 'info',
    success: 'success',
    warning: 'warning',
    error: 'error',
    notify (text,
        type = this.info) {
        ElMessage(
            {
                type,
                message: text
            }
        )
    },
    confirm (text,
        title = t.value.noun.hint,
        confirm,
        cancel,
        type = this.warning) {
        ElMessageBox
            .confirm(text, title,
                {
                    type,
                    confirmButtonText: t.value.action.confirm,
                    cancelButtonText: t.value.action.cancel
                }
            )
            .then(confirm || null)
            .catch(cancel || null)
    }
}
