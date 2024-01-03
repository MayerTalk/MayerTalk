import { uuid } from '@/lib/utils/tool'

class Hook {
    constructor (onFunction = null, callFunction = null) {
        this.hooks = {}
        if (onFunction) {
            this.on = (fn) => onFunction(this, fn)
        }
        if (callFunction) {
            this.call = (params) => callFunction(this, params)
        }
    }

    on (fn) {
        const id = uuid()
        this.hooks[id] = fn
        return () => {
            delete this.hooks[id]
        }
    }

    call (params) {
        for (const key in this.hooks) {
            if (Object.prototype.hasOwnProperty.call(this.hooks, key)) {
                this.hooks[key](params)
            }
        }
    }
}

export default Hook
