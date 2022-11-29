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
        download(canvas.toDataURL(), 'arktalk-' + Date.now() + '.png');
        callback && callback()
    }).catch(message.notify)
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

export {
    copy,
    uuid,
    saveData,
    getData,
    download,
    downloadImage,
    blob2url,
    blob2base64
}