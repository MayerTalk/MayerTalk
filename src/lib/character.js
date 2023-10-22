import { ref } from 'vue'

import Request from '@/lib/request'
import { cacheRequest } from '@/lib/cacheRequest'
import { copy } from '@/lib/tool'
import { fullWidth2HalfLatin } from '@/lib/lang/fullWidth2HalfLatin'

const AliasApi = new Request({ host: 'https://alias.arkfans.top/' })

const CharDict = {}
const loaded = []
const Suffix = (navigator.userAgent.indexOf('Chrome') === -1 && navigator.userAgent.indexOf('Safari') !== -1)
    ? '.png'
    : '.webp'

function parseAvatarUrl (url, series, charId) {
    // 生成可访问的头像url
    return 'avatar/' +
        encodeURIComponent(series) + '/' +
        encodeURIComponent(url.indexOf('id:') === 0 ? url.slice(3) : charId + url) +
        Suffix
}

function loadChar (series) {
    // 从资源站加载头像
    if (loaded.indexOf(series) !== -1) {
        return
    }

    cacheRequest('char/' + series, 'characterVersion.' + series, (resp) => {
        loaded.indexOf(series) === -1 && loaded.push(series)
        for (const charId in resp.data) {
            if (!Object.prototype.hasOwnProperty.call(resp.data, charId)) {
                continue
            }
            const data = resp.data[charId]
            for (const avatarId in data.avatars) {
                if (!Object.prototype.hasOwnProperty.call(data.avatars, avatarId)) {
                    continue
                }
                data.avatars[avatarId] = parseAvatarUrl(data.avatars[avatarId], series, charId)
            }
            data.series = series
            CharDict[charId] = data
        }
    })
}

// const seriesSort = {
//     arknights: 1
// }

const TagSort = {
    operator: 1001,
    token: 1002,
    trap: 1003,
    enemy: 1004
}

function sortByLength (a, b, lang) {
    // 按名称长短排序
    const A = a.names[lang]
    const B = b.names[lang]
    if (!A) {
        return 1
    } else if (!B) {
        return -1
    }
    return A.length - B.length
}

function sortBySeries (a, b) {
    // 按系列排序
    return (TagSort[a.series] || 100) - (TagSort[b.series] || 100)
}

function sortByTag (a, b) {
    // 按Tag排序
    for (let i = 0; i < a.tags.length && i < b.tags.length; i++) {
        if (a.tags[i] === b.tags[i]) {
            continue
        }
        return TagSort[a.tags[i]] - TagSort[b.tags[i]]
    }
    return 0
}

function firstSort (a, b, lang) {
    // 基础排序
    return sortBySeries(a, b) || sortByTag(a, b) || sortByLength(a, b, lang)
}

const sortDict = {
    // 语种特殊排序
    zh_CN: (a, b) => {
        const A = a.names.fpy
        const B = b.names.fpy
        if (A === B) {
            return 0
        } else {
            return A > B ? 1 : -1
        }
    },
    zh_TW: (a, b) => {
        const A = a.names.fpy
        const B = b.names.fpy
        if (A === B) {
            return 0
        } else {
            return A > B ? 1 : -1
        }
    }
}

function sortChar (list, lang) {
    // 联合排序
    sortDict[lang]
        ? list.sort((a, b) => {
            const A = CharDict[a]
            const B = CharDict[b]
            return firstSort(A, B, lang) || sortDict[lang](A, B)
        })
        : list.sort((a, b) => {
            const A = CharDict[a]
            const B = CharDict[b]
            return firstSort(A, B, lang)
        })
}

const searchResult = ref(false)
const AliasAddition = ref([])

let searchResultFullShow = 0

const SearchManager = class SearchManager {
    // 管理单次搜索
    constructor (search, t, list, lang = 'zh_CN') {
        this.search = search
        this.t = t
        // raw list 用于溯源
        this.raw_list = copy(list)
        this.list = list
        // 继承上一次别名搜索结果，避免闪烁出现
        for (const charId of AliasAddition.value) {
            if (this.list.indexOf(charId) === -1) {
                this.list.push(charId)
            }
        }
        this.lang = lang
        this.res = []
        self.showed = false
    }

    // 对搜索结果进行排序
    sort () {
        sortChar(this.list, this.lang)
    }

    // 生成可供渲染的结果
    gen () {
        this.res = []
        for (let i = 0; i < this.list.length; i++) {
            const charId = this.list[i]
            // [charId, charName]
            this.res.push([charId, CharDict[charId].names[this.lang] || CharDict[charId].names.zh_CN])
            // for (let j = 0; j < CharDict[charId].avatars.length; j++) {
            //     this.res.push([CharDict[charId].avatars[j], CharDict[charId].avatars[j], CharDict[charId].names[this.lang]])
            // }
        }
    }

    // 大批量结果优化，延迟输出
    show () {
        if (this.res.length) {
            // 优化：延迟输出
            // TODO use virtual list
            if (this.res.length > 400) {
                searchResult.value = this.res.slice(0, 40)
                setTimeout(() => {
                    if (searchResultFullShow === this.t) {
                        searchResult.value = this.res
                    }
                    this.showed = true
                }, 1000)
            } else if (this.res.length > 40) {
                searchResult.value = this.res.slice(0, 40)
                setTimeout(() => {
                    if (searchResultFullShow === this.t) {
                        searchResult.value = this.res
                    }
                    this.showed = true
                }, 200)
            } else {
                searchResult.value = this.res
                this.showed = true
            }
        } else {
            searchResult.value = false
            this.showed = true
        }
    }

    // 启动别名搜索
    searchAlias (success, error) {
        if (AliasApi.cancelTokens.length) {
            for (const item of AliasApi.cancelTokens) {
                item.cancel()
            }
            AliasApi.cancelTokens = []
        }
        AliasApi.get({
            url: 'alias/search',
            data: {
                lang: 7, // zh_CN + en_US + ja_JP
                output: 4, // ID
                type: 39, // OPERATOR + TOKEN + ENEMY
                mode: 14, // IN + PINYIN + IGNORE_CASE
                text: this.search // 搜素文本
                // 详细参数可在 https://alias.arkfans.top/docs/api/api.html 查看
            },
            success,
            error
        })
    }

    // 处理别名搜索结果
    aliasHandler (callback) {
        return (response) => {
            this.list = this.raw_list
            AliasAddition.value = []
            callback && callback(response)
            this.sort()
            this.gen()
            if (this.showed && this.t === searchResultFullShow && this.res.length) {
                searchResult.value = this.res
            }
        }
    }

    // 运行搜索
    run () {
        this.sort()
        this.gen()
        this.show()
        this.searchAlias(this.aliasHandler((resp) => {
            for (const charId of resp.data) {
                if (Object.prototype.hasOwnProperty.call(CharDict, charId)) {
                    if (this.list.indexOf(charId) === -1) {
                        this.list.push(charId)
                    }
                    AliasAddition.value.push(charId)
                }
            }
        }), this.aliasHandler())
    }
}

// 处理搜索文本
function parseSearch (search) {
    // TODO i18n 根据lang决定是否处理
    // 部分输入法拼音输入阶段会携带” ' “，导致拼音搜索失效
    search = search.replaceAll('\'', '')
    // “6/MSP” 不清楚此字符为何，但出现在部分输入法拼音输入阶段
    search = search.replaceAll(' ', '')
    // 全宽拉丁处理
    search = fullWidth2HalfLatin(search)
    return search
}

// 搜索函数
function searchCharHandler (search) {
    search = parseSearch(search)
    // 用于避免延时输出干扰后续搜索
    const t = Date.now()
    searchResultFullShow = t
    if (search) {
        const searchLower = search.toLowerCase()
        const list = []
        for (const charId in CharDict) {
            if (Object.prototype.hasOwnProperty.call(CharDict, charId)) {
                const char = CharDict[charId]
                for (const lang in char.names) {
                    if (Object.prototype.hasOwnProperty.call(char.names, lang)) {
                        if (char.names[lang].indexOf(searchLower) !== -1) {
                            list.push(charId)
                            break
                        }
                    }
                }
            }
        }
        const manager = new SearchManager(search, t, list)
        manager.run()
    } else {
        AliasAddition.value = []
        searchResult.value = []
    }
}

export {
    Suffix,
    CharDict,
    loadChar,
    sortChar,
    searchResult,
    searchCharHandler
}
