import {getData, saveData, blob2url, download} from '@/lib/tool'
import message from '@/lib/message'
import {
    config,
    chats,
    chars,
    images,
    DataControl
} from '@/data'

const latestVersion = 'a';
let currVersion = getData('data.version') || 'a';

const versionSwitcher = {
    a: () => {
        // version a to version b
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
    saveData('data.version', version)
}

function downloadData() {
    const url = blob2url(new Blob([JSON.stringify({
        version: currVersion,
        config: config.value,
        chars: chars.value,
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
            DataControl.save();
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