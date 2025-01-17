import { ref } from 'vue'

import Request from '@/lib/utils/request'
import { cacheRequest } from '@/lib/utils/cacheRequest'
import { copy } from '@/lib/utils/tool'
import { fullWidth2HalfLatin } from '@/lib/lang/fullWidth2HalfLatin'
import { characterHost } from '@/lib/dev'
import { config } from '@/lib/data/data'
import { IsSafari } from '@/lib/data/constance'

const AliasApi = new Request({ host: 'https://alias.arkfans.top/' })

const CharDict = {}
const loaded = []
const Suffix = IsSafari ? '.png' : '.webp'

const langOrder = ['zh_CN', 'zh_TW', 'py', 'fpy', 'en_US', 'ja_JP', 'code']

function parseAvatarUrl (url, series, charId) {
    // 生成可访问的头像url
    if (series === 'arknights_npc') {
        return 'avatar/' +
            encodeURIComponent(series) + '/' +
            encodeURIComponent(charId) + '/' +
            encodeURIComponent(url) +
            Suffix
    } else {
        return 'avatar/' +
            encodeURIComponent(series) + '/' +
            encodeURIComponent(url.indexOf('id:') === 0 ? url.slice(3) : charId + url) +
            Suffix
    }
}

function parseCharData (data) {
    const names = {}
    for (let i = 0; i < langOrder.length; i++) {
        if (data[0][i]) {
            names[langOrder[i]] = data[0][i].toLowerCase()
        }
    }
    return {
        names,
        avatars: data[1],
        tags: data[2]
    }
}

function loadChar (series) {
    // 从资源站加载头像
    if (loaded.indexOf(series) !== -1) {
        return
    }

    cacheRequest({
        url: 'char/'+ series,
        key: 'characterVersion.' + series,
        success:(resp) => {
            if (loaded.indexOf(series) === -1) {
                loaded.push(series)
            }
            for (const charId in resp.data) {
                if (!Object.prototype.hasOwnProperty.call(resp.data, charId)) {
                    continue
                }
                const data = parseCharData(resp.data[charId])
                for (const avatarId in data.avatars) {
                    if (!Object.prototype.hasOwnProperty.call(data.avatars, avatarId)) {
                        continue
                    }
                    data.avatars[avatarId] = parseAvatarUrl(data.avatars[avatarId], series, charId)
                }
                data.series = series
                CharDict[`${series}.${charId}`] = data
            }
        },
        fetchFirst:true,
        host: characterHost
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

const Search = class Search {
    // 管理单次搜索
    constructor (searchManager, search, t, list, lang = 'zh_CN') {
        this.searchManager = searchManager
        this.search = search
        this.t = t
        // raw list 用于溯源
        this.raw_list = copy(list)
        this.list = []
        this.lang = lang
        this.res = []
        this.nameCache = {}
        self.showed = false
    }

    genList () {
        // 合并raw_list(源石搜索结果)与extraSearch
        const list = copy(this.raw_list)
        for (const key in this.searchManager.extraResult) {
            if (Object.prototype.hasOwnProperty.call(this.searchManager.extraResult, key)) {
                this.searchManager.extraResult[key].forEach((charId) => {
                    if (list.indexOf(charId) === -1) {
                        list.push(charId)
                    }
                })
            }
        }
        this.list = list
    }

    // 对搜索结果进行排序
    sort () {
        sortChar(this.list, this.lang)
    }

    // 生成可供渲染的结果
    genResult () {
        this.res = []
        for (let i = 0; i < this.list.length; i++) {
            const charId = this.list[i]
            // [charId, charName]
            this.res.push([charId, CharDict[charId].names[this.lang] || CharDict[charId].names.zh_CN || this.nameCache[charId]])
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
                this.searchManager.result.value = this.res.slice(0, 40)
                setTimeout(() => {
                    if (this.searchManager.searchResultFullShow === this.t) {
                        this.searchManager.result.value = this.res
                    }
                    this.showed = true
                }, 1000)
            } else if (this.res.length > 40) {
                this.searchManager.result.value = this.res.slice(0, 40)
                setTimeout(() => {
                    if (this.searchManager.searchResultFullShow === this.t) {
                        this.searchManager.result.value = this.res
                    }
                    this.showed = true
                }, 200)
            } else {
                this.searchManager.result.value = this.res
                this.showed = true
            }
        } else {
            this.searchManager.result.value = []
            this.showed = true
        }
    }

    searchExtra () {
        // 额外搜索 (包括别名, npc)
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
                output: 6, // NAME + ID
                type: 39, // OPERATOR + TOKEN + ENEMY + NPC
                mode: 14, // IN + PINYIN + IGNORE_CASE
                text: this.search // 搜素文本
                // 详细参数可在 https://alias.arkfans.top/docs/api/api.html 查看
            },
            success: this.handleExtraSearch('arknights'),
            error: this.handleExtraSearchFail('arknights')
        })
        AliasApi.get({
            url: 'npc/search',
            data: {
                output: 6, // NAME + ID
                mode: 14, // IN + PINYIN + IGNORE_CASE
                text: this.search // 搜素文本
                // 详细参数可在 https://alias.arkfans.top/docs/api/api.html 查看
            },
            success: this.handleExtraSearch('arknights_npc'),
            error: this.handleExtraSearchFail('arknights_npc')
        })
    }

    handleExtraSearch (key, series = null) {
        series = series || key
        return (response) => {
            const list = []
            response.data.forEach((data) => {
                const charId = `${series}.${data[1]}`
                this.nameCache[charId] = data[0]
                if (Object.prototype.hasOwnProperty.call(CharDict, charId)) {
                    list.push(charId)
                }
            })
            this.searchManager.extraResult[key] = list
            this.output()
            if (this.showed && this.t === this.searchManager.searchResultFullShow) {
                this.searchManager.result.value = this.res
            }
        }
    }

    handleExtraSearchFail (key) {
        return () => {
            delete this.searchManager.extraResult[key]
            this.output()
            if (this.showed && this.t === this.searchManager.searchResultFullShow) {
                this.searchManager.result.value = this.res
            }
        }
    }

    output () {
        this.genList()
        this.sort()
        this.genResult()
    }

    // 运行搜索
    run () {
        this.output()
        this.show()
        this.searchExtra()
    }
}

// 处理搜索文本
function parseSearch (param) {
    // TODO i18n 根据lang决定是否处理
    // 部分输入法拼音输入阶段会携带” ' “，导致拼音搜索失效
    param = param.replaceAll('\'', '')
    // “6/MSP” 不清楚此字符为何，但出现在部分输入法拼音输入阶段
    param = param.replaceAll(' ', '')
    // 全宽拉丁处理
    param = fullWidth2HalfLatin(param)
    return param
}

const SearchManager = class SearchManager {
    constructor () {
        this.result = ref(null)
        this.extraResult = {}
        this.searchResultFullShow = 0
    }

    search (param) {
        if (!param) {
            this.result.value = null
            return
        }
        param = parseSearch(param)
        // 用于避免延时输出干扰后续搜索
        const t = Date.now()
        this.searchResultFullShow = t
        if (param) {
            const searchLower = param.toLowerCase()
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
            const manager = new Search(this, param, t, list, config.value.lang)
            manager.run()
        } else {
            this.extraResult = {}
            this.result.value = []
        }
    }
}

const loadSeries = {
    arknights () {
        loadChar('arknights')
        loadChar('arknights_npc')
    }
}

export {
    Suffix,
    CharDict,
    loadChar,
    loadSeries,
    sortChar,
    SearchManager
}
