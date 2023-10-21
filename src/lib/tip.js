import { ref } from 'vue'
import { copy } from '@/lib/tool'

const tipControl = {
    tip: ref(''),
    cache: [],
    pool: [],
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
        this.cache = copy(this.pool)
        this.drawTip()
    },
    setTips (tips) {
        this.pool = tips
        this.reloadTips()
    },
    drawTip () {
        const p = Math.floor(Math.random() * this.cache.length) - 1
        this.tip.value = this.cache.splice(p, 1)
    }
}
tipControl.loop()

export default tipControl
