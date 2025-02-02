import { t } from '@/lib/lang/translate'
import { v4 as uuid } from 'uuid'
import md5 from 'blueimp-md5'
import html2canvas from 'html2canvas'
import message from './message'
import { IsMobile } from '@/lib/data/constance'
import Input from '@/lib/function/input'
import type { Ref } from 'vue';
import type { Callback, CallBackData, OptionalCallback } from '@/lib/utils/types';

function copy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj))
}

function saveData(name: string, data: object | string | number) {
    let dataStr: string
    if (typeof data === 'object') {
        dataStr = JSON.stringify(data)
    } else {
        dataStr = data.toString()
    }
    localStorage.setItem(name, dataStr)
}

function getData<T>(name: string): T | null {
    let data = localStorage.getItem(name)
    if (data) {
        try {
            data = JSON.parse(data)
        } catch {
        }
    }
    return data as T | null
}

function getCanvas(node: HTMLElement, options: object, cb: CallBackData<HTMLCanvasElement>) {
    html2canvas(node, options).then(canvas => {
        cb(canvas)
    }).catch(err => {
        message.confirm(err + t.value.tip.errorGuide, t.value.tip.error)
        throw err
    })
}

function downloadCanvas(canvas: HTMLCanvasElement, cb: OptionalCallback, options: {
    filename?: string,
    title?: string
}) {
    canvas.toBlob((blob) => {
        if (blob) {
            const url = blob2url(blob)
            download(url, options.filename || 'mayertalk-' + (options.title || Date.now()) + '.jpg')
            if (cb) {
                cb()
            }
        } else {
            message.notify(t.value.notify.downloadCanvasFailed, message.error)
        }
    }, 'image/jpeg')
}

function download(url: string, filename: string) {
    const el = document.createElement('a')
    document.body.appendChild(el)
    el.download = filename
    el.href = url
    el.click()
    el.remove()
}

function blob2url(blob: Blob): string {
    let url: string | null = null
    if (window.URL.createObjectURL !== undefined) {
        url = window.URL.createObjectURL(blob)
    } else if (window.webkitURL !== undefined) {
        url = window.webkitURL.createObjectURL(blob)
    } else {
        throw Error('blob2url failed')
    }
    return url as string
}

function blob2base64(blob: Blob, callback: CallBackData<string>) {
    const reader = new FileReader()
    reader.onloadend = () => {
        callback(reader.result as string)
    }
    reader.readAsDataURL(blob)
}

function image2square(image: HTMLImageElement) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const w = image.width
    const h = image.height
    const crop = Math.floor(Math.abs(w - h) / 2)
    const m = Math.min(w, h)
    const size = Math.min(m, 512)
    canvas.width = size
    canvas.height = size
    if (w > h) {
        ctx.drawImage(image, crop, 0, m, m, 0, 0, size, size)
    } else {
        ctx.drawImage(image, 0, crop, m, m, 0, 0, size, size)
    }
    return canvas
}

function ensure(done: Callback, text: string) {
    message.confirm(text, t.value.noun.hint, () => {
        done()
    })
}

function ensureClose(done: Callback) {
    ensure(done, t.value.notify.whetherQuitEditing)
}

type ClickableHTMLElement = HTMLElement & { click: () => void }

function clickBySelector(selector: string) {
    const el = document.querySelector(selector) as ClickableHTMLElement | null
    if (el) {
        el.click()
    }
}

function getDialogue(id: string) {
    return document.getElementById(id)
}

function doAfter<T>(fn: () => T, callback: CallBackData<T>, cd = 0) {
    if (fn()) {
        callback(fn())
    } else {
        setTimeout(() => {
            doAfter(fn, callback, cd)
        }, cd)
    }
}

function doAfterRefMounted(ref: Ref, callback: CallBackData<boolean>) {
    doAfter(() => {
        return ref.value && ref
    }, callback, 0)
}

const SizeUnit = ['B', 'KB', 'MB', 'GB', 'TB']

function formatSize(size: number, unit = SizeUnit[0]) {
    for (let i = 1; size > 1024; i++) {
        size /= 1024
        unit = SizeUnit[i]
    }
    return size.toFixed(2) + unit
}


const Textarea: {
    el: NonNullable<HTMLInputElement>,
    focus: () => void
} = {
    el: null!,
    focus() {
    // message.notify(Date.now() - this.lastFocusout)
        if (!IsMobile || Input.inputting()) {
            // 非手机(自动focus) or 输入法唤起状态(保持输入法唤起)
            this.el.focus()
        }
    }
}
doAfter(() => {
    return document.getElementById('textarea')
}, (el) => {
    Textarea.el = el as HTMLInputElement
})

function bool(obj: string | number | boolean | object): boolean {
    if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
        return Boolean(obj);
    } else if (Array.isArray(obj) && obj.length === 0) {
        return false;
    } else if (typeof obj === 'object' && Object.keys(obj).length === 0) {
        return false;
    }
    return true;
}


function sync(dst: object, srcDefault: object, srcTarget: object) {
    // target default variable
    for (const key in srcDefault) {
        if (Object.prototype.hasOwnProperty.call(srcDefault, key)) {
            if (typeof srcDefault[key] === 'object') {
                dst[key] = {}
                sync(dst[key], srcDefault[key], srcTarget[key] || {})
            } else {
                dst[key] = srcDefault[key]
            }
        }
    }
    for (const key in srcTarget) {
        if (Object.prototype.hasOwnProperty.call(srcTarget, key)) {
            if (typeof srcTarget[key] !== 'object' && (srcTarget[key] || typeof srcTarget[key] === 'boolean')) {
                dst[key] = srcTarget[key]
            }
        }
    }
}

function parseFilename(filename: string): string {
    // 检查文件名，去除非法字符，并缩减长度
    const newFilename = filename.replace(/[\\/:*?"<>|]/, '')
    return newFilename.length <= 64 ? newFilename : newFilename.slice(0, 64)
}

function setKeyFalseDelete(obj: object, key: string, value: string | number | boolean | object, falseCheck = null) {
    if (!(falseCheck || bool)(value)) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            delete obj[key]
        }
    } else {
        obj[key] = value
    }
}

export {
    md5,
    copy,
    uuid,
    saveData,
    getData,
    download,
    blob2url,
    blob2base64,
    image2square,
    ensure,
    ensureClose,
    clickBySelector,
    getDialogue,
    doAfter,
    doAfterRefMounted,
    Textarea,
    formatSize,
    bool,
    getCanvas,
    downloadCanvas,
    sync,
    parseFilename,
    setKeyFalseDelete
}
