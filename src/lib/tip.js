import { ref } from 'vue'
import { t } from '@/lib/lang/translate'
import { copy } from '@/lib/tool'

const tipControl = {
    tip: ref(''),
    cache: [],
    until: 0,
    cd: 5000,
    hook: null,
    loop () {
        if (Date.now() > this.until) {
            if (this.cache.length < 1) {
                this.reloadTips()
            } else {
                this.drawTip()
            }
            t.value.action.hint += '1'

            this.hook && this.hook()
        }
        setTimeout(() => {
            this.loop()
        }, this.cd)
    },
    setTmpTip (tip, timeout = 5000) {
        this.tip.value = tip
        this.until = Date.now() + timeout
    },
    reloadTips () {
        this.cache = copy(t.value.tip.pool)
        this.drawTip()
    },
    drawTip () {
        const p = Math.floor(Math.random() * this.cache.length) - 1
        this.tip.value = this.cache.splice(p, 1)
    }
}
tipControl.loop()

export default tipControl
