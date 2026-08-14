import { ref, type Ref } from 'vue'
import type { AxiosResponse } from 'axios';

import { copy } from '@/lib/utils/tool'
import Request from '@/lib/utils/request'
import { cacheRequest } from '@/lib/utils/cacheRequest'
import { fullWidth2HalfLatin } from '@/lib/lang/fullWidth2HalfLatin'

import { config } from '@/lib/data/data'
import { characterHost } from '@/lib/dev'
import { IsSafari } from '@/lib/data/constance'

const AliasApi = new Request({ host: 'https://alias.arkfans.top/' })

const CharDict: Record<string, CharacterData> = {}
const loaded = new Set<string>()
const Suffix = IsSafari ? '.png' : '.webp'
const UnknownCharacter = 'UnknownCharacter'

type CharacterRequestData = [
    names: Array<string>,
    avatars: Array<string>,
    tags: Array<string>
]

// output=6 时搜索结果固定为 [name, id]
type CharacterSearchData = [
    name: string,
    id: string
]

// 角色选择结果：avatar 为头像路径，name 为优先名称，extraNames 为远程接口返回的 name 备选（最低优先级）
interface CharacterSelectResult {
    avatar: string
    name: string
    extraNames?: Array<string>
}

const langOrder = ['zh_CN', 'zh_TW', 'py', 'fpy', 'en_US', 'ja_JP', 'code'] as const
type LangType = typeof langOrder[number]
type CharacterNames = Partial<Record<LangType, string>>;

interface CharacterData {
    names: CharacterNames;
    avatars: Array<string>;
    tags: Array<string>;
    series: string;
}

function parseAvatarUrl(url: string, series: string, charId: string) {
    const basePath = `avatar/${encodeURIComponent(series)}`;
    const fileName = series === 'arknights_npc'
        ? `${encodeURIComponent(charId)}/${encodeURIComponent(url)}`
        : encodeURIComponent(url.startsWith('id:') ? url.slice(3) : charId + url);
    return `${basePath}/${fileName}${Suffix}`;
}


function parseCharData(data: CharacterRequestData, charId: string, series: string): CharacterData {
    const names: CharacterNames = {}
    const avatars: Array<string> = []

    for (let i = 0; i < langOrder.length; i++) {
        if (data[0][i]) {
            names[langOrder[i]] = data[0][i].toLowerCase()
        }
    }
    data[1].forEach((avatarId) => {
        avatars.push(parseAvatarUrl(avatarId, series, charId))
    })

    return {
        names,
        avatars,
        tags: data[2],
        series
    }
}

function loadChar(series: string) {
    // 从资源站加载头像
    if (loaded.has(series)) {
        return;
    }

    cacheRequest<Record<string, CharacterRequestData>>({
        url: 'char/' + series,
        key: 'characterVersion.' + series,
        success: (resp) => {
            if (!loaded.has(series)) {
                loaded.add(series)
            }
            for (const charId in resp.data) {
                if (!Object.prototype.hasOwnProperty.call(resp.data, charId)) {
                    continue
                }
                CharDict[`${series}.${charId}`] = parseCharData(resp.data[charId], charId, series)
            }
        },
        fetchFirst: true,
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
} as const

function sortByLength(a: CharacterData, b: CharacterData, lang: LangType) {
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

function sortBySeries(a: CharacterData, b: CharacterData) {
    // 按系列排序
    return (TagSort[a.series as keyof typeof TagSort] || 100) - (TagSort[b.series as keyof typeof TagSort] || 100)
}

function sortByTag(a: CharacterData, b: CharacterData) {
    // 按Tag排序
    for (let i = 0; i < a.tags.length && i < b.tags.length; i++) {
        if (a.tags[i] === b.tags[i]) {
            continue
        }
        return TagSort[a.tags[i] as keyof typeof TagSort] - TagSort[b.tags[i] as keyof typeof TagSort]
    }
    return 0
}

function firstSort(a: CharacterData, b: CharacterData, lang: LangType) {
    // 基础排序
    return sortBySeries(a, b) || sortByTag(a, b) || sortByLength(a, b, lang)
}

type SortFunction = (a: CharacterData, b: CharacterData) => number;
const sortDict: Record<string, SortFunction> = {
    // 语种特殊排序
    zh_CN: (a, b) => {
        const A = a.names.fpy || ''
        const B = b.names.fpy || ''
        if (A === B) {
            return 0
        } else {
            return A > B ? 1 : -1
        }
    },
    zh_TW: (a, b) => {
        const A = a.names.fpy || ''
        const B = b.names.fpy || ''
        if (A === B) {
            return 0
        } else {
            return A > B ? 1 : -1
        }
    }
}

function sortChar(list: Array<string>, lang: LangType) {
    // 联合排序
    if (Object.prototype.hasOwnProperty.call(sortDict, lang)) {
        list.sort((a, b) => {
            const A = CharDict[a]
            const B = CharDict[b]
            return firstSort(A, B, lang) || sortDict[lang](A, B)
        })
    } else {
        list.sort((a, b) => {
            const A = CharDict[a]
            const B = CharDict[b]
            return firstSort(A, B, lang)
        })
    }
}

class Search {
    searchManager: SearchManager
    search: string
    t: number
    raw_list: Array<string>
    list: Array<string>
    lang: LangType
    res: Array<[string, string]>
    showed: boolean

    // 管理单次搜索
    constructor(searchManager: SearchManager, search: string, t: number, list: Array<string>, lang: LangType = 'zh_CN') {
        this.searchManager = searchManager
        this.search = search
        this.t = t
        // raw list 用于溯源
        this.raw_list = copy(list)
        this.list = []
        this.lang = lang
        this.res = []
        this.showed = false
    }

    genList() {
        // 合并raw_list(源石搜索结果)与extraSearch
        const list = new Set([...this.raw_list]);
        for (const key in this.searchManager.extraResult) {
            if (Object.prototype.hasOwnProperty.call(this.searchManager.extraResult, key)) {
                this.searchManager.extraResult[key].forEach((item) => list.add(item[0]));
            }
        }
        this.list = Array.from(list);
    }

    // 对搜索结果进行排序
    sort() {
        sortChar(this.list, this.lang)
    }

    // 生成可供渲染的结果
    genResult() {
        this.res = []
        for (let i = 0; i < this.list.length; i++) {
            const charId = this.list[i]
            // [charId, charName]
            // 优先设置的语种，如无使用zh_CN；CharDict名称缺失时回退远程接口返回的name
            const charDictName = CharDict[charId].names[this.lang] || CharDict[charId].names.zh_CN
            const name = charDictName || this.searchManager.getExtraNames(charId)[0] || UnknownCharacter
            this.res.push([charId, name])
        }
    }

    // 大批量结果优化，延迟输出
    show() {
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

    searchExtra() {
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
                type: 39, // OPERATOR + TOKEN(召唤物) + ENEMY + NPC
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

    handleExtraSearch(key: string, series?: string) {
        series = series || key
        return (response: AxiosResponse<Array<CharacterSearchData>>) => {
            // 忽略过期搜索的响应，避免污染当前搜索
            if (this.t !== this.searchManager.searchResultFullShow) {
                return
            }
            const list: Array<[charId: string, name: string]> = []
            response.data.forEach((data) => {
                const charId = `${series}.${data[1]}`
                if (Object.prototype.hasOwnProperty.call(CharDict, charId)) {
                    // [charId, name]，name 作为 defaultName 的低优先级备选
                    list.push([charId, data[0]])
                }
            })
            this.searchManager.extraResult[key] = list
            this.output()
            if (this.showed) {
                this.searchManager.result.value = this.res
            }
        }
    }

    handleExtraSearchFail(key: string) {
        return () => {
            // 忽略过期搜索的响应，避免误删当前搜索的数据
            if (this.t !== this.searchManager.searchResultFullShow) {
                return
            }
            delete this.searchManager.extraResult[key]
            this.output()
            if (this.showed) {
                this.searchManager.result.value = this.res
            }
        }
    }

    output() {
        this.genList()
        this.sort()
        this.genResult()
    }

    // 运行搜索
    run() {
        this.output()
        this.show()
        this.searchExtra()
    }
}

// 处理搜索文本
function parseSearch(param: string) {
    // TODO i18n 根据lang决定是否处理
    // 部分输入法拼音输入阶段会携带“ ' ”，导致拼音搜索失效
    param = param.replaceAll('\'', '')
    // “6/MSP”，U+2006，“六分之一空格” 出现在部分输入法拼音输入阶段
    param = param.replaceAll(' ', '')
    // 全宽拉丁处理
    param = fullWidth2HalfLatin(param)
    return param
}

class SearchManager {
    result: Ref<Array<[string, string]> | null>
    extraResult: Record<string, Array<[charId: string, name: string]>>
    searchResultFullShow: number


    constructor() {
        this.result = ref(null)
        this.extraResult = {}
        this.searchResultFullShow = 0
    }

    getExtraNames(charId: string) {
        // 收集远程接口返回的该角色name备选（最低优先级），去重保序
        const names: Array<string> = []
        for (const key in this.extraResult) {
            if (Object.prototype.hasOwnProperty.call(this.extraResult, key)) {
                this.extraResult[key].forEach((item) => {
                    if (item[0] === charId && names.indexOf(item[1]) === -1) {
                        names.push(item[1])
                    }
                })
            }
        }
        return names
    }

    search(param?: string) {
        if (!param) {
            this.result.value = null
            return
        }
        param = parseSearch(param)
        // 用于避免延时输出干扰后续搜索
        const t = Date.now()
        this.searchResultFullShow = t
        if (param) {
            // 清空上一次搜索的残留结果，避免干扰当前搜索
            this.extraResult = {}
            const searchLower = param.toLowerCase()
            const list: Array<string> = []
            for (const charId in CharDict) {
                if (Object.prototype.hasOwnProperty.call(CharDict, charId)) {
                    const char = CharDict[charId]
                    for (const lang of Object.keys(char.names) as LangType[]) {
                        const name = char.names[lang]
                        if (name && name.indexOf(searchLower) !== -1) {
                            list.push(charId)
                            break
                        }
                    }
                }
            }
            const manager = new Search(this, param, t, list, config.value.lang as LangType)
            manager.run()
        } else {
            this.extraResult = {}
            this.result.value = []
        }
    }
}

const loadSeries = {
    arknights() {
        loadChar('arknights')
        loadChar('arknights_npc')
    }
}

export {
    Suffix,
    UnknownCharacter,
    CharDict,
    loadChar,
    loadSeries,
    sortChar,
    SearchManager,
    type CharacterSelectResult
}
