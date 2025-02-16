import Hook from '@/lib/utils/hook.ts';

const WindowResize = new Hook<undefined>()

window.onresize = () => {
    WindowResize.call(undefined)
}

export default WindowResize
