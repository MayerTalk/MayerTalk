import { IsMobile } from '@/lib/data/constance'
import WindowResize from '@/lib/utils/windowResize'
import Hook from '@/lib/utils/hook'

const Input = {
    height: window.innerHeight,
    width: window.innerWidth,
    threshold: 100,
    inputting () {
        if (IsMobile && this.height - window.innerHeight > this.threshold) {
            return this.height - window.innerHeight
        }
    },
    hook: new Hook()
}

let lastHeight = window.innerHeight

if (IsMobile) {
    WindowResize.onResize(() => {
        if (lastHeight !== window.innerHeight) {
            if (window.innerWidth !== Input.width) {
                Input.height = window.innerHeight
                Input.width = window.innerWidth
            } else {
                Input.hook.call({
                    status: window.innerHeight < lastHeight,
                    diff: lastHeight - window.innerHeight
                })
            }
        }
        lastHeight = window.innerHeight
    })
}

export default Input
