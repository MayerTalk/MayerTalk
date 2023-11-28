import { uuid } from '@/lib/tool'

const WindowResize = {
    listeners: {},
    onResize (fn) {
        const id = uuid()
        this.listeners[id] = fn
        return () => {
            delete this.listeners[id]
        }
    },
    callListeners () {
        for (const key in this.listeners) {
            if (Object.prototype.hasOwnProperty.call(this.listeners, key)) {
                this.listeners[key]()
            }
        }
    }
}

window.onresize = () => { WindowResize.callListeners() }

export default WindowResize
