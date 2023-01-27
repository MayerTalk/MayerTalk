import axios from "axios";

axios.defaults.withCredentials = false;

export default class Requests {
    constructor(config) {
        this.host = config.host;
    }

    httpRequests(method, options) {
        try {
            const url = options.url;
            const data = options.data || {};
            const success = options.success;
            const error = options.error;
            const complete = options.complete;

            const post = ['PUT', 'POST', 'PATCH'].indexOf(method.toUpperCase()) >= 0;

            const params = post ? 'data' : 'params';
            const payload = post && options.json ? JSON.stringify(data) : data;
            const headers = {
                'Content-Type': 'application/json',
                ...options.headers || {}
            };

            const config = {
                url: this.host + url,
                method: method,
                headers: headers,
                [params]: payload
            };

            for (let name in headers) {
                config.headers[name] = headers[name]
            }

            axios(config)
                .then(
                    response => {
                        success && success(response)
                    }
                )
                .catch(
                    err => {
                        error && error(err)
                    }
                )
                .finally(
                    () => {
                        complete && complete()
                    }
                );
        } catch (error) {
            throw error
        }
    }

    get(options) {
        this.httpRequests('get', options)
    }

    post(options) {
        this.httpRequests('post', options)
    }
}
