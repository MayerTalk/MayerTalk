import Request from '@/lib/request'
import {StaticUrl} from "@/constance";

const request = new Request({host: StaticUrl});

const CharDict = {};
const loaded = [];

function loadChar(series) {
    if (loaded.indexOf(series) !== -1) {
        return
    }
    request.get({
        url: 'version/' + series + '.txt?t=' + Date.now(),
        success: (resp) => {
            request.get({
                url: 'char/' + series + '.json?v=' + resp.data,
                success: (resp) => {
                    loaded.push(series);
                    for (let charId in resp.data) {
                        if (resp.data.hasOwnProperty(charId)) {
                            CharDict[charId] = resp.data[charId]
                        }
                    }
                }
            })
        }
    })
}

const TagSort = {
    arknights: 1,
    operator: 1001,
    token: 1002,
    trap: 1003,
    enemy: 1004
};

function sortTag(a, b) {
    const A = CharDict[a];
    const B = CharDict[b];
    for (let i = 0; i < A.tags.length && i < B.tags.length; i++) {
        if (A.tags[i] === B.tags[i]) {
            continue
        }
        return TagSort[A.tags[i]] - TagSort[B.tags[i]]
    }
    return 0
}

function sort_zh_CN(a, b) {
    const A = CharDict[a].names.fpy;
    const B = CharDict[b].names.fpy;
    if (A === B) {
        return 0
    } else {
        return A > B ? 1 : -1
    }
}

const sortDict = {
    zh_CN: sort_zh_CN
};

function sortChar(list, lang) {
    sortDict[lang] ? list.sort((a, b) => {
        return sortTag(a, b) || sortDict[lang](a, b)
    }) : list.sort(sortTag)
}

export {
    CharDict,
    loadChar,
    sortChar
}