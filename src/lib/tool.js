import {v4 as uuid} from 'uuid'
import html2canvas from 'html2canvas';

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


function downloadImage(node, callback) {
    html2canvas(node).then(canvas => {
        const el = document.createElement('a');
        el.download = 'screenshot.png';
        el.href = canvas.toDataURL();
        el.click();
        callback && callback()
    })
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


export {
    copy,
    uuid,
    saveData,
    getData,
    downloadImage
}