import {computed} from 'vue'
import {getData, saveData, blob2url, download, md5} from '@/lib/tool'
import message from '@/lib/message'
import {
    config,
    chats,
    chars,
    images,
    DataControl
} from '@/data'
import {StaticUrl} from '@/constance'
import {copy} from "./tool";

const latestVersion = 'b';
let currVersion = getData('data.version') || 'a';
const versionSwitcher = {
    a: () => {
        // v0.0.5 -> v0.1.0 / a -> b
        // png2webp / image ref / char.src (computed)
        const tmp = {};
        const change = {};
        for (let key in images.value) {
            if (images.value.hasOwnProperty(key)) {
                const id = md5(images.value[key]);
                change[key] = id;
                if (tmp.hasOwnProperty(id)) {
                    tmp[id].count++
                } else {
                    tmp[id] = {
                        count: 1,
                        src: images.value[key]
                    }
                }
            }
        }
        for (let i = 0; i < chats.value.length; i++) {
            const chat = chats.value[i];
            if (chat.type === 'image' && change.hasOwnProperty(chat.content)) {
                chat.content = change[chat.content]
            }
        }
        for (let key in chars.value) {
            if (chars.value.hasOwnProperty(key)) {
                const char = chars.value[key];
                if (change.hasOwnProperty(char.avatar)) {
                    char.avatar = change[char.avatar];
                } else {
                    char.avatar = char.avatar.replace('.png','.webp')
                }
                char.src = computed(() => {
                    const avatar = chars.value[key].avatar;
                    return images.value.hasOwnProperty(avatar) ? images.value[avatar].src : StaticUrl + avatar
                });
            }
        }
        images.value = tmp;
        DataControl.update('chars', 'chats', 'images');
        return 'b'
    }
};

function switchVersion(version) {
    while (version !== latestVersion) {
        try {
            version = versionSwitcher[version]()
        } catch (e) {
            break
        }
    }
    currVersion = version;
    DataControl.save();
    saveData('data.version', version)
}

function downloadData() {
    const _chars = copy(chars.value);
    for (let key in _chars) {
        if (_chars.hasOwnProperty(key) && _chars[key].hasOwnProperty('src')) {
            delete _chars[key].src
        }
    }
    const url = blob2url(new Blob([JSON.stringify({
        version: currVersion,
        config: config.value,
        chars: _chars,
        chats: chats.value,
        images: images.value
    })], {type: 'application/json'}));
    download(url, 'mayertalk-data-' + Date.now() + '.json')
}

function uploadData(uploadFile, callback) {
    const reader = new FileReader();
    reader.onloadend = () => {
        try {
            const data = JSON.parse(reader.result);
            DataControl.set(data);
            switchVersion(data.version || 'a');
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

switchVersion(currVersion);

export {
    switchVersion,
    uploadData,
    downloadData
}