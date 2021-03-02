// 1. 抹平请求方式的差异
// 2. 响应超时功能(终止请求)
// 3. 对不同响应数据的转化
// 4. Fetch 拦截器


window.fetch = (originalFetch => {
    return async function (args) {
        const controller = new AbortController()

        if (window.fetch.requestInterceptor) {
            let ret
            if (typeof args === 'string') {
                ret = window.fetch.requestInterceptor({
                    url:  args,
                    method: 'GET'
                })
            } else {
                ret = window.fetch.requestInterceptor({
                    url: args.url,
                    ...args
                })
            }

            if (args.timeout) {
                setTimeout(() => controller.abort(), args.timeout)
            } else if (ret.timeout) {
                setTimeout(() => controller.abort(), ret.timeout)
            }

            const { url, timeout, ...options } = ret
            if (options.data) {
                options.body = typeof options.data === 'object' ? JSON.stringify(options.data) : options.data
                delete options.data
            }
            options.signal = controller.signal

            const result = await originalFetch(url, options)

            if (result.status === 200) {
                let res
                const str = result.headers.get('Content-Type').split(';')[0]
                if (str === 'application/json') {
                    res = await result.json()
                } else if (/^text\//.test(str)) {
                    res = await result.text()
                } else {
                    res = await result.blob()
                }
        
                if (window.fetch.responseInterceptor) {
                    return window.fetch.responseInterceptor(res)
                }
                return res
            }

            return Promise.reject(result)
        } else {
            let result
            if (typeof args === 'string') {
                result = await originalFetch(args, { signal: controller.signal })
            } else {
                if (args.url) {
                    const { url, timeout, ...options } = args
                    if (options.data) {
                        options.body = typeof options.data === 'object' ? JSON.stringify(options.data) : options.data
                        delete options.data
                    }

                    timeout && setTimeout(() => controller.abort(), timeout)

                    options.signal = controller.signal
                    result = await originalFetch(url, options)
                }
            }

            if (result.status === 200) {
                let res
                const str = result.headers.get('Content-Type').split(';')[0]
                if (str === 'application/json') {
                    res = await result.json()
                } else if (/^text\//.test(str)) {
                    res = await result.text()
                } else {
                    res = await result.blob()
                }

                if (window.fetch.responseInterceptor) {
                    return window.fetch.responseInterceptor(res)
                }
                return res
            }
            return Promise.reject(result)
        }
    }
})(window.fetch)
