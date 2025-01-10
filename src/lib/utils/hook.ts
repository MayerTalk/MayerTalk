import { uuid } from '@/lib/utils/tool'

interface OnFunction<T> {
    (hook: Hook<T>, fn: (params: T) => void): () => void
}

interface CallFunction<T> {
    (hook: Hook<T>, params: T): void
}


class Hook<T> {
    hooks: { [id: string]: (params: T) => void }


    constructor(onFunction?: OnFunction<T>, callFunction?: CallFunction<T>) {
        this.hooks = {}
        if (onFunction) {
            this.on = (fn) => onFunction(this, fn)
        }
        if (callFunction) {
            this.call = (params) => callFunction(this, params)
        }
    }

    on(fn: (params: T) => void) {
        const id = uuid()
        this.hooks[id] = fn
        return () => {
            delete this.hooks[id]
        }
    }

    call(params: T) {
        for (const key in this.hooks) {
            if (Object.prototype.hasOwnProperty.call(this.hooks, key)) {
                this.hooks[key](params)
            }
        }
    }
}

export default Hook
