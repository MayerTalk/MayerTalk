import { IsMobile } from '@/lib/constance'
import WindowResize from '@/lib/windowResize'

const Input = {
    height: window.innerHeight,
    width: window.innerWidth,
    threshold: 100,
    inputting () {
        if (IsMobile && this.height - window.innerHeight > this.threshold) {
            return this.height - window.innerHeight
        }
    },
    onInputHooks: [],
    onInput (fn) {
        this.onInputHooks.push(fn)
    }
}

let lastHeight = window.innerHeight

if (IsMobile) {
    WindowResize.onResize(() => {
        if (lastHeight !== window.innerHeight) {
            if (window.innerWidth !== Input.width) {
                Input.height = window.innerHeight
                Input.width = window.innerWidth
            } else {
                Input.onInputHooks.forEach((fn) => {
                    fn(window.innerHeight < lastHeight, lastHeight - window.innerHeight)
                })
            }
        }
        lastHeight = window.innerHeight
    })
}

export default Input
