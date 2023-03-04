import { ref } from 'vue'
import { copy } from '@/lib/tool'

const tipControl = {
    tip: ref(''),
    pool: [
        '素材库里除了有干员头像，还有召唤物/敌人/装置的',
        '上传的头像会自动剪裁成正方形',
        '博士，剿灭打了吗？',
        '点击对话框可以编辑/插入对话',
        '不选中任何角色时，将以旁白视角发送对话',
        'Ctrl+Enter可以快捷发送',
        'Ctrl+Z/ctrl+Y可以撤回/重做',
        'Ctrl+1~9可以快捷切换角色'
    ],
    cache: [],
    until: 0,
    cd: 5000,
    hook: null,
    loop () {
        if (Date.now() > this.until) {
            if (this.cache.length < 1) {
                this.cache = copy(this.pool)
            }
            const p = Math.floor(Math.random() * this.cache.length) - 1
            this.tip.value = this.cache.splice(p, 1)
            this.hook && this.hook()
        }
        setTimeout(() => {
            this.loop()
        }, this.cd)
    },
    setTmpTip (tip, timeout = 5000) {
        this.tip.value = tip
        this.until = Date.now() + timeout
    }
}
tipControl.loop()

export default tipControl
