import {getData, saveData, blob2url, download, md5} from '@/lib/tool'
import message from '@/lib/message'
import {
    config,
    chats,
    chars,
    images,
    settings,
    DataControl
} from '@/lib/data'

const latestVersion = 'c';
const initialVersion = 'a';
let currVersion = getData('data.version') || initialVersion;
const versionSwitcher = {
    a: (data, opt) => {
        // v0.0.5 -> v0.1.0 / a -> b
        // png2webp / image ref / char.src (computed)
        const tmp = {};
        const change = {};
        for (let key in data.images) {
            if (data.images.hasOwnProperty(key)) {
                const id = md5(data.images[key]);
                change[key] = id;
                if (tmp.hasOwnProperty(id)) {
                    tmp[id].count++
                } else {
                    tmp[id] = {
                        count: 1,
                        src: data.images[key]
                    }
                }
            }
        }
        for (let i = 0; i < data.chats.length; i++) {
            const chat = data.chats[i];
            if (chat.type === 'image' && change.hasOwnProperty(chat.content)) {
                chat.content = change[chat.content]
            }
        }
        for (let key in data.chars) {
            if (data.chars.hasOwnProperty(key)) {
                const char = data.chars[key];
                if (change.hasOwnProperty(char.avatar)) {
                    char.avatar = change[char.avatar];
                }
            }
        }
        data.images = tmp;
        return 'b'
    },
    b: (data, opt) => {
        if (opt.load) {
            // v 0.1.0 -> v0.1.1 / b -> c
            // indexDB
            const dataStr = localStorage.getItem('data.images');
            if (dataStr) {
                data.imgaes = JSON.parse(dataStr);
                DataControl.image.sync();
                localStorage.removeItem('data.images')
            }
        }
        return 'c'
    }
};

function switchVersion(data, opt = {}) {
    let version = data.version || initialVersion;
    while (version !== latestVersion) {
        try {
            version = versionSwitcher[version](data, opt)
        } catch (e) {
            break
        }
    }
    currVersion = version;
    saveData('data.version', version)
}

function getDataJson(full = false) {
    const data = {
        version: currVersion,
        config: config.value,
        chars: chars.value,
        chats: chats.value,
        images: images.value
    };
    if (full) {
        data.settings = settings.value;
    }
    return data
}

function getDataString(full = false) {
    return JSON.stringify(getDataJson(full))
}

function downloadData() {
    const url = blob2url(new Blob([getDataString()], {type: 'application/json'}));
    download(url, 'mayertalk-data-' + Date.now() + '.json')
}

function uploadData(uploadFile, callback) {
    const reader = new FileReader();
    reader.onloadend = () => {
        try {
            const data = JSON.parse(reader.result);
            switchVersion(data);
            DataControl.set(data, false);
            DataControl.save();
            message.notify('导入成功', message.success);
            callback && callback()
        } catch (e) {
            console.log(e);
            message.notify('导入失败，请确认文件名为 mayertalk-data-xxx.json', message.error)
        }
    };
    reader.readAsText(uploadFile);
    return false
}

function loadData() {
    if (latestVersion === currVersion) {
        DataControl.load()
    } else {
        DataControl.load((data, next) => {
            data.version = currVersion;
            switchVersion(data, {
                load: true
            });
            Object.entries(next).forEach((obj) => {
                obj[1]()
            })
        })
    }
}

loadData();

export {
    initialVersion,
    switchVersion,
    getDataJson,
    getDataString,
    uploadData,
    downloadData
}