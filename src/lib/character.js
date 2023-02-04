import {ref} from 'vue'

import Request from '@/lib/request'
import {StaticUrl} from "@/lib/constance";

const request = new Request({host: StaticUrl});
const AliasApi = new Request({host: 'https://alias.arkfans.top/'});

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

const searchResult = ref(false);


let searchResultFullShow = 0;

const SearchManager = class SearchManager {
    constructor(search, t, list, lang = 'zh_CN') {
        this.search = search;
        this.t = t;
        this.list = list;
        this.lang = lang;
        this.res = [];
        self.showed = false;
    }

    sort() {
        sortChar(this.list, this.lang)
    }

    gen() {
        this.res = [];
        for (let i = 0; i < this.list.length; i++) {
            const charId = this.list[i];
            for (let j = 0; j < CharDict[charId].avatars.length; j++) {
                this.res.push([CharDict[charId].avatars[j], CharDict[charId].avatars[j], CharDict[charId].names[this.lang]])
            }
        }
    }

    show() {
        if (this.res) {
            // 优化：延迟输出
            // TODO use virtual list
            if (this.res.length > 400) {
                searchResult.value = this.res.slice(0, 40);
                setTimeout(() => {
                    if (searchResultFullShow === this.t) {
                        searchResult.value = this.res
                    }
                    this.showed = true
                }, 1000)
            } else if (this.res.length > 40) {
                searchResult.value = this.res.slice(0, 40);
                setTimeout(() => {
                    if (searchResultFullShow === this.t) {
                        searchResult.value = this.res
                    }
                    this.showed = true
                }, 200)
            } else {
                searchResult.value = this.res;
                this.showed = true
            }
        } else {
            searchResult.value = false;
            this.showed = true
        }
    }

    searchAlias(callback) {
        if (AliasApi.cancelTokens.length) {
            for (let item of AliasApi.cancelTokens) {
                item.cancel()
            }
            AliasApi.cancelTokens = []
        }
        AliasApi.get({
            url: 'alias/search?lang=ALL&output=4&type=39&text=' + this.search,
            success(resp) {
                callback && callback(resp.data)
            }
        })
    }

    run() {
        this.sort();
        this.gen();
        this.show();
        this.searchAlias((data) => {
            for (let charId of data) {
                if (this.list.indexOf(charId) === -1) {
                    this.list.push(charId);
                }
            }
            this.sort();
            this.gen();
            if (this.showed && this.t === searchResultFullShow) {
                searchResult.value = this.res
            }
        })
    }
};

function searchCharHandler(search) {
    const t = Date.now();
    searchResultFullShow = t;
    if (search) {
        const searchLower = search.toLowerCase();
        const list = [];
        for (let charId in CharDict) {
            if (CharDict.hasOwnProperty(charId)) {
                const char = CharDict[charId];
                for (let lang in char.names) {
                    if (char.names.hasOwnProperty(lang)) {
                        if (char.names[lang].indexOf(searchLower) !== -1) {
                            list.push(charId);
                            break
                        }
                    }
                }
            }
        }
        const manager = new SearchManager(search, t, list);
        manager.run()
    } else {
        searchResult.value = [
            ['博士', 'avatar/arknights/doctor' + Suffix, '博士'],
            ['PRTS', 'avatar/arknights/PRTS' + Suffix, 'PRTS'],
            ['mon3tr', 'avatar/arknights/mon3tr' + Suffix, 'mon3tr'],
            ['凯尔希', 'avatar/arknights/char_003_kalts' + Suffix, '凯尔希']
        ]
    }
}

export {
    CharDict,
    loadChar,
    sortChar,
    searchResult,
    searchCharHandler,
    Suffix as AvatarSuffix
}