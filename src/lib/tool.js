import { t } from '@/lib/lang/translate'
import { v4 as uuid } from 'uuid'
import md5 from 'blueimp-md5'
import html2canvas from 'html2canvas'
import message from './message'
import { WindowHeight, IsMobile } from '@/lib/constance'

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

function download (url, filename) {
    const el = document.createElement('a')
    document.body.appendChild(el)
    el.download = filename
    el.href = url
    el.click()
    el.remove()
}

function downloadImage (node, options, callback, seq = null) {
    html2canvas(node, options).then(canvas => {
        canvas.toBlob(blob => {
            download(blob2url(blob), 'mayertalk-' + (seq || Date.now()) + '.jpg')
            callback && callback(canvas)
        }, 'image/jpeg')
    }).catch(reason => {
        message.confirm(reason + t.value.tip.errorGuide, t.value.tip.error)
    })
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
    let selector
    if (id.search(/^\d/) === 0) {
        selector = '#\\3' + id.slice(0, 1) + ' ' + id.slice(1)
    } else {
        selector = '#' + id
    }
    return document.querySelector(selector)
}

function doAfterMounted (ref, callback) {
    if (ref.value) {
        callback(ref)
    } else {
        setTimeout(() => {
            doAfterMounted(ref, callback)
        }, 0)
    }
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
    focus () {
        // message.notify(Date.now() - this.lastFocusout)
        if (!IsMobile || WindowHeight - window.innerHeight > 100) {
            // 非手机(自动focus) or 输入法唤起状态(保持输入法唤起)
            document.getElementById('textarea').focus()
        }
    }
}

function bool (obj) {
    if (!obj) {
        return false
    } else if (obj.length === 0) {
        return false
    } else if (Object.keys(obj).length === 0) {
        return false
    }
    return true
}

export {
    md5,
    copy,
    uuid,
    saveData,
    getData,
    download,
    downloadImage,
    blob2url,
    blob2base64,
    image2square,
    ensure,
    ensureClose,
    clickBySelector,
    getDialogue,
    doAfterMounted,
    Textarea,
    formatSize,
    bool
}
