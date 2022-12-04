import {v4 as uuid} from 'uuid'
import html2canvas from 'html2canvas';
import message from "./message";

function copy(obj) {
    return JSON.parse(JSON.stringify(obj))
}

function saveData(name, data) {
    let dataStr = null;
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


function getData(name) {
    let data = localStorage.getItem(name);
    if (data) {
        try {
            data = JSON.parse(data)
        } catch (e) {
        }
        return data
    }
}

function download(url, filename) {
    const el = document.createElement('a');
    el.download = filename;
    el.href = url;
    el.click();
}

function downloadImage(node, options, callback) {
    html2canvas(node, options).then(canvas => {
        canvas.toBlob(blob => {
            download(blob2url(blob), 'arktalk-' + Date.now() + '.jpg');
            callback && callback()
        }, 'image/jpeg')
    }).catch((reason => {
        message.confirm(reason + '，如果可以，请截图此页面，并加入交流群反馈 (๑╹◡╹)ﾉ"""', '工口发生')
    }))
}

function blob2url(blob) {
    let url = null;
    if (window.createObjectURL !== undefined) {
        url = window.createObjectURL(blob)
    } else if (window.URL.createObjectURL !== undefined) {
        url = window.URL.createObjectURL(blob)
    } else if (window.webkitURL !== undefined) {
        url = window.webkitURL.createObjectURL(blob)
    }
    return url
}

function blob2base64(blob, callback) {
    const reader = new FileReader();
    reader.onloadend = (b64) => {
        callback(reader.result)
    };
    reader.readAsDataURL(blob);

}

function image2square(image) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const w = image.width;
    const h = image.height;
    const crop = Math.ceil(Math.abs(w - h) / 2);
    const m = Math.min(w, h);
    const size = Math.min(m, 512);
    canvas.width = size;
    canvas.height = size;
    if (w > h) {
        ctx.drawImage(image, crop, 0, m, m, 0, 0, size, size);
    } else {
        ctx.drawImage(image, 0, crop, m, m, 0, 0, size, size);
    }
    return canvas.toDataURL()
}

export {
    copy,
    uuid,
    saveData,
    getData,
    download,
    downloadImage,
    blob2url,
    blob2base64,
    image2square
}