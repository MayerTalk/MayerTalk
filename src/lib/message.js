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
        title = '提示',
        confirm,
        cancel,
        type = this.warning) {
        ElMessageBox
            .confirm(text, title,
                {
                    type,
                    confirmButtonText: '确定',
                    cancelButtonText: '取消'
                }
            )
            .then(confirm || null)
            .catch(cancel || null)
    }
}
