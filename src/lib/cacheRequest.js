import { getData, saveData } from '@/lib/tool'
import Request from '@/lib/request'
import { StaticUrl } from '@/lib/constance'

const staticApi = new Request({ host: StaticUrl })

function cacheRequest (url, key, cb, versionUrl) {
    // url: 静态站下资源链接& key: localStorage.cache.key& cb: 回调& versionUrl:默认从url中提取
    const name = 'cache.' + key
    const cache = getData(name) || ''
    const relUrl = url.split('/')[url.split('/').length - 1].split('.').length > 1 ? url : url + '.json'

    function fetch (v) {
        staticApi.get({
            url: relUrl,
            data: {
                v
            },
            success (resp) {
                cb(resp)
            },
            error (resp) {
                cb(resp, false)
            }
        })
    }

    const relVersionUrl = versionUrl || 'version/' +
        relUrl.split('.').slice(0, relUrl.split('.').length - 1).join('.') + '.txt'

    fetch(cache)
    staticApi.get({
        url: relVersionUrl,
        data: {
            t: Date.now() + ''
        },
        success (resp) {
            if (resp.data !== cache) {
                saveData(name, resp.data)
                if (cache) {
                    fetch(resp.data)
                }
            }
        }
    })
}

export {
    cacheRequest
}
