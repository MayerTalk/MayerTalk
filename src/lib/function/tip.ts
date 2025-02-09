import { ref } from 'vue'
import type { Ref } from 'vue'
import { copy } from '@/lib/utils/tool'

type hook = () => void
const TipControl = new class TipControl {
    tip: Ref<string>
    cache: Array<string>
    pool: Array<string>
    until: number
    cd: number
    hook: null | hook

    constructor() {
        this.tip = ref('')
        this.cache = []
        this.pool = []
        this.until = 0
        this.cd = 5000
        this.hook = null
    }

    loop () {
        if (Date.now() > this.until) {
            if (this.cache.length < 1) {
                this.reloadTips()
            } else {
                this.drawTip()
            }
            if (this.hook) {
                this.hook()
            }
        }
        setTimeout(() => {
            this.loop()
        }, this.cd)
    }
    setTmpTip (tip:string, timeout = 5000) {
        this.tip.value = tip
        this.until = Date.now() + timeout
    }
    reloadTips () {
        this.cache = copy(this.pool)
        this.drawTip()
    }
    setTips (tips:Array<string>) {
        this.pool = tips
        this.reloadTips()
    }
    drawTip () {
        const p = Math.floor(Math.random() * this.cache.length) - 1
        this.tip.value = this.cache.splice(p, 1)[0]
    }
}
TipControl.loop()

export default TipControl
