import { t } from '@/lib/lang/translate'
import { v4 as uuid } from 'uuid'
import md5 from 'blueimp-md5'
import html2canvas from 'html2canvas'
import message from './message'
import { IsMobile } from '@/lib/data/constance'
import Input from '@/lib/function/input'

function copy (obj) {
    return JSON.parse(JSON.stringify(obj))
}

function saveData (name, data) {
    let dataStr = null
    if (typeof data === 'object') {
        dataStr = JSON.stringify(data)
    }
    if (typeof data === 'string' || typeof data === 'number') {
        dataStr = data.toString()
    }
    if (dataStr) {
        localStorage.setItem(name, dataStr)
    }
}

function getData (name) {
    let data = localStorage.getItem(name)
    if (data) {
        try {
            data = JSON.parse(data)
        } catch (e) {
        }
        return data
    }
}

function getCanvas (node, options, cb) {
    html2canvas(node, options).then(canvas => {
        cb(canvas)
    }).catch(err => {
        message.confirm(err + t.value.tip.errorGuide, t.value.tip.error)
        throw err
    })
}

function downloadCanvas (canvas, cb, options) {
    canvas.toBlob((blob) => {
        try {
            const url = blob2url(blob)
            download(url, options.filename || 'mayertalk-' + (options.title || Date.now()) + '.jpg')
            cb && cb()
        } catch (e) {
            message.notify(t.value.notify.downloadCanvasFailed, message.error)
        }
    }, 'image/jpeg')
}

function download (url, filename) {
    const el = document.createElement('a')
    document.body.appendChild(el)
    el.download = filename
    el.href = url
    el.click()
    el.remove()
}

function blob2url (blob) {
    let url = null
    if (window.createObjectURL !== undefined) {
        url = window.createObjectURL(blob)
    } else if (window.URL.createObjectURL !== undefined) {
        url = window.URL.createObjectURL(blob)
    } else if (window.webkitURL !== undefined) {
        url = window.webkitURL.createObjectURL(blob)
    }
    return url
}

function blob2base64 (blob, callback) {
    const reader = new FileReader()
    reader.onloadend = () => {
        callback(reader.result)
    }
    reader.readAsDataURL(blob)
}

function image2square (image) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
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

function ensure (done, text) {
    message.confirm(text, t.value.noun.hint, () => {
        done()
    })
}

function ensureClose (done) {
    ensure(done, t.value.notify.whetherQuitEditing)
}

function clickBySelector (selector) {
    document.querySelector(selector).click()
}

function getDialogue (id) {
    return document.getElementById(id)
}

function doAfter (fn, callback, cd = 0) {
    if (fn()) {
        callback(fn())
    } else {
        setTimeout(() => {
            doAfter(fn, callback, cd)
        }, cd)
    }
}

function doAfterRefMounted (ref, callback) {
    doAfter(() => {
        return ref.value && ref
    }, callback, 0)
}

const SizeUnit = ['B', 'KB', 'MB', 'GB', 'TB']

function formatSize (size, unit = SizeUnit[0]) {
    for (let i = 1; size > 1024; i++) {
        size /= 1024
        unit = SizeUnit[i]
    }
    return size.toFixed(2) + unit
}

const Textarea = {
    el: null,
    focus () {
        // message.notify(Date.now() - this.lastFocusout)
        if (!IsMobile || Input.inputting()) {
            // 非手机(自动focus) or 输入法唤起状态(保持输入法唤起)
            this.el.focus()
        }
    }
}
doAfter(() => {
    return document.getElementById('textarea')
},
(el) => {
    Textarea.el = el
})

function bool (obj) {
    if (['string', 'number', 'boolean'].indexOf(typeof obj) !== -1) {
        return Boolean(obj)
    } else if (obj.length === 0) {
        return false
    } else if (Object.keys(obj).length === 0) {
        return false
    }
    return true
}

function sync (dst, srcDefault, srcTarget) {
    // target default variable
    for (const key in srcDefault) {
        if (Object.prototype.hasOwnProperty.call(srcDefault, key)) {
            if (typeof srcDefault[key] === 'object') {
                dst[key] = {}
                sync(dst[key], srcDefault[key], srcTarget[key] || {}, key)
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

function parseFilename (filename) {
    // 检查文件名，去除非法字符，并缩减长度
    const newFilename = filename.replace(/[\\/:*?"<>|]/, '')
    return newFilename.length <= 64 ? newFilename : newFilename.slice(0, 64)
}

function setKeyFalseDelete (obj, key, value, falseCheck = null) {
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
