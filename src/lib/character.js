import Request from '@/lib/request'
import {StaticUrl} from "@/constance";

const request = new Request({host: StaticUrl});

const CharDict = {};
const loaded = [];
const Suffix = (navigator.userAgent.indexOf("Chrome") === -1 && navigator.userAgent.indexOf("Safari") !== -1)
    ? '.png' : '.webp';

function parseAvatarUrl(url, series, charId) {
    if (url.indexOf('id:') === 0) {
        url = 'avatar/' + series + '/' + url.slice(3) + Suffix
    } else {
        url = 'avatar/' + series + '/' + charId + url + Suffix
    }
    return url.replace('#', '%23')
}

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
                        if (!resp.data.hasOwnProperty(charId)) {
                            continue
                        }
                        const data = resp.data[charId];
                        for (let avatarId in data.avatars) {
                            if (!data.avatars.hasOwnProperty(avatarId)) {
                                continue
                            }
                            data.avatars[avatarId] = parseAvatarUrl(data.avatars[avatarId], series, charId);
                        }
                        data.series = series;
                        CharDict[charId] = data
                    }
                }
            })
        }
    })
}

const seriesSort = {
    arknights: 1,
};

const TagSort = {
    operator: 1001,
    token: 1002,
    trap: 1003,
    enemy: 1004
};

function firstSort(a, b) {
    const A = CharDict[a];
    const B = CharDict[b];
    if (TagSort[A.series] !== TagSort[B.series]) {
        return TagSort[A.series] - TagSort[B.series]
    }
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
        return firstSort(a, b) || sortDict[lang](a, b)
    }) : list.sort(firstSort())
}

export {
    CharDict,
    loadChar,
    sortChar,
    Suffix as AvatarSuffix
}