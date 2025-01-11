import { getData, saveData } from '@/lib/utils/tool'
import Request from '@/lib/utils/request'
import { StaticUrl } from '@/lib/data/constance'
import type { AxiosError, AxiosResponse } from 'axios';

const staticApi = new Request({ host: StaticUrl })

function cacheRequest<T>(url: string, key: string, cb: (resp: AxiosResponse<T> | AxiosError, success?: boolean) => void, versionUrl?: string, fetchFirst = true, host?: string) {
    // url: 静态站下资源链接& key: localStorage.cache.key& cb: 回调& versionUrl:默认从url中提取
    const name = 'cache.' + key
    const cache = getData<string | null>(name) || ''
    const relUrl = url.split('/')[url.split('/').length - 1].split('.').length > 1 ? url : url + '.json'

    function fetch(v:string) {
        staticApi.get({
            host,
            url: relUrl,
            data: {
                v
            },
            success(resp) {
                cb(resp)
            },
            error(resp) {
                cb(resp, false)
            }
        })
    }

    const relVersionUrl = versionUrl || 'version/' +
        relUrl.split('.').slice(0, relUrl.split('.').length - 1).join('.') + '.txt'

    if (fetchFirst) {
        fetch(cache)
    }
    staticApi.get({
        host,
        url: relVersionUrl,
        data: {
            t: Date.now() + ''
        },
        success(resp) {
            if (resp.data !== cache) {
                saveData(name, resp.data)
                if (cache || !fetchFirst) {
                    fetch(resp.data)
                }
            }
        },
        error() {
            // 获取版本发生错误，强制更新
            if (!fetchFirst) {
                fetch(Date.now() + '')
            }
        }
    })
}

export {
    cacheRequest
}
