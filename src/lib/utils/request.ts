import axios from 'axios'
import type { AxiosRequestConfig, AxiosResponse, AxiosError, Canceler } from 'axios'

axios.defaults.withCredentials = false

interface RequestsConfig {
    host: string
}

interface RequestsOptions<T> {
    host?: string
    url: string,
    data?: object,
    success?: (response: AxiosResponse<T>) => void,
    error?: (err: AxiosError) => void,
    complete?: () => void,
    json?: object,
    headers?: { [key: string]: string }
}

export default class Requests {
    host: string
    cancelTokens: Array<{ cancel: Canceler }>

    constructor(config: RequestsConfig) {
        this.host = config.host
        this.cancelTokens = []
    }

    httpRequests<T>(method: string, options: RequestsOptions<T>) {
        const url = options.url
        const data = options.data || {}
        const success = options.success
        const error = options.error
        const complete = options.complete

        const post = ['PUT', 'POST', 'PATCH'].indexOf(method.toUpperCase()) >= 0

        const payload = post && options.json ? JSON.stringify(data) : data
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers || {}
        }

        const config: AxiosRequestConfig = {
            url: (options.host || this.host) + url,
            method: method as AxiosRequestConfig['method'],
            headers,
            cancelToken: new axios.CancelToken(cancel => {
                this.cancelTokens.push({ cancel })
            })
        }
        if (post) {
            config.data = payload
        } else {
            config.params = payload
        }

        axios<T>(config)
            .then(
                response => {
                    if (success) {
                        success(response)
                    }
                }
            )
            .catch(
                err => {
                    if (error) {
                        error(err)
                    }
                }
            )
            .finally(
                () => {
                    if (complete) {
                        complete()
                    }
                }
            )
    }

    get<T>(options: RequestsOptions<T>) {
        this.httpRequests<T>('get', options)
    }
}
