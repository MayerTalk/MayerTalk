import { getData, saveData } from '@/lib/utils/tool'
import Request from '@/lib/utils/request'
import { StaticUrl } from '@/lib/data/constance'
import type { AxiosError, AxiosResponse } from 'axios';

const staticApi = new Request({ host: StaticUrl })

interface cacheRequestOptions<T> {
    url: string
    key: string,
    success?: (resp: AxiosResponse<T>) => void,
    error?: (error: AxiosError) => void,
    versionUrl?: string,
    fetchFirst?: boolean,
    host?: string
}

function cacheRequest<T>(options: cacheRequestOptions<T>) {
    // url: 静态站下资源链接& key: localStorage.cache.key& cb: 回调& versionUrl:默认从url中提取
    const url = options.url
    const fetchFirst = options.fetchFirst

    const name = 'cache.' + options.key
    const cache = getData<string | null>(name) || ''
    const relUrl = url.split('/')[url.split('/').length - 1].split('.').length > 1 ? url : url + '.json'

    function fetch(v: string) {
        staticApi.get<T>({
            host: options.host,
            url: relUrl,
            data: {
                v
            },
            success(resp: AxiosResponse<T>) {
                if (options.success) {
                    options.success(resp)
                }
            },
            error(err) {
                if (options.error) {
                    options.error(err)
                }
            }
        })
    }

    const relVersionUrl = options.versionUrl || 'version/' +
        relUrl.split('.').slice(0, relUrl.split('.').length - 1).join('.') + '.txt'

    if (fetchFirst) {
        fetch(cache)
    }
    staticApi.get<string>({
        host: options.host,
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
