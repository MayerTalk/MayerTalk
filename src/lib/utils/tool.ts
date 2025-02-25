import { t } from '@/lib/lang/translate'
import { v4 as uuid } from 'uuid'
import md5 from 'blueimp-md5'
import html2canvas from 'html2canvas'
import message from './message'
import { IsMobile } from '@/lib/data/constance'
import Input from '@/lib/function/input'
import type { Ref } from 'vue';
import type { Callback, CallBackWithData, OptionalCallback } from '@/lib/utils/types';

function hasOwn<T extends object, K extends string>(obj: T, key: K): obj is T & Record<K, unknown> {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

function isObject(value: unknown): value is object {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function copy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj))
}

function ensureValue<T>(value: T, name: string = 'Val'): NonNullable<T> {
    if (value === null || value === undefined) {
        throw new Error(`${name} is not a valid value`)
    }
    return value as NonNullable<T>
}

function assertNonValue<T>(value: T, name: string = 'Val'): asserts value is NonNullable<T> {
    if (value === null || value === undefined) {
        throw new Error(`${name} is not a valid value`)
    }
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

function getCanvas(node: HTMLElement, options: object, cb: CallBackWithData<HTMLCanvasElement>) {
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

function blob2base64(blob: Blob, callback: CallBackWithData<string>) {
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

function ensureMessage(done: Callback, text: string) {
    message.confirm(text, t.value.noun.hint, () => {
        done()
    })
}

function ensureClose(done: Callback) {
    ensureMessage(done, t.value.notify.whetherQuitEditing)
}

type ClickableHTMLElement = HTMLElement & { click: () => void }

function clickBySelector(selector: string) {
    const el = document.querySelector(selector) as ClickableHTMLElement | null
    if (el) {
        el.click()
    }
}

function getDialogue(id: string): HTMLElement {
    const dialog = document.getElementById(id)
    return ensureValue(dialog, `Dialogue ${id} not found`)
}

function doAfter<T>(fn: () => T | null, callback: CallBackWithData<NonNullable<T>>, cd = 0) {
    const res = fn()
    if (res) {
        callback(res)
    } else {
        setTimeout(() => {
            doAfter(fn, callback, cd)
        }, cd)
    }
}

function doAfterRefMounted<T>(ref: Ref<T>, callback: CallBackWithData<Ref<NonNullable<T>>>) {
    doAfter(() => {
        return ref.value ? ref as Ref<NonNullable<T>> : null
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

function parseFilename(filename: string): string {
    // 检查文件名，去除非法字符，并缩减长度
    const newFilename = filename.replace(/[\\/:*?"<>|]/, '')
    return newFilename.length <= 64 ? newFilename : newFilename.slice(0, 64)
}


function withDefault<T extends object>(value: object, defaultValue: Readonly<T>): T {
    const result: T = {} as T

    for (const key in value) {
        if (!hasOwn(value, key)) continue
        const v = value[key]

        if (isObject(v) && hasOwn(defaultValue, key)) {
            const defaultValueVal = v[key]
            if (isObject(defaultValueVal)) {
                result[key] = withDefault(v, defaultValueVal)
            } else {
                result[key] = v as typeof defaultValueVal
            }
        } else {
            result[key] = v
        }
    }

    for (const key in defaultValue) {
        if (!hasOwn(defaultValue, key)) continue

        if (Object.prototype.hasOwnProperty.call(result, key)) {
            const resultVal = result[key]
            const defaultValueVal = copy(defaultValue[key])
            if (isObject(resultVal) && isObject(defaultValueVal)) {
                result[key] = withDefault(resultVal, defaultValueVal) as typeof defaultValueVal
            }
        } else {
            result[key] = copy(defaultValue[key])
        }
    }
    return result
}

function excludeDefault<T>(value: object, defaultValue: Readonly<object>): T {
    const result = copy(value)

    for (const key in result) {
        if (!hasOwn(value, key)) continue
        const resultVal = result[key]
        const defaultValueVal = defaultValue[key]
        if (isObject(resultVal) && hasOwn(defaultValue, key) && isObject(defaultValueVal)) {
            const processed = excludeDefault(resultVal, defaultValueVal)
            result[key] = processed

            if (Object.keys(processed as object).length === 0) {
                delete result[key]
            }
        } else if (resultVal === defaultValueVal) {
            delete result[key]
        }
    }
    return result as T
}

export {
    md5,
    copy,
    uuid,
    hasOwn,
    ensureValue,
    assertNonValue,
    isObject,
    saveData,
    getData,
    download,
    blob2url,
    blob2base64,
    image2square,
    ensureMessage,
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
    parseFilename,
    withDefault,
    excludeDefault
}
