import Hook from '@/lib/utils/hook';

const WindowResize = new Hook<undefined>()

window.onresize = () => {
    WindowResize.call(undefined)
}

export default WindowResize
