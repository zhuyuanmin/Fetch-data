// 1. 抹平请求方式的差异
// 2. 响应超时功能(终止请求)
// 3. 对不同响应数据的转化 --> 目前只转化字符串
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

            const { url, ...options } = ret
            if (options.data) {
                options.body = typeof options.data === 'object' ? JSON.stringify(options.data) : options.data
                delete options.data
            }
            options.signal = controller.signal

            const result = await originalFetch(url, options)

            if (result.status === 200) {
                const res = await result.text()
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
                    const { url, ...options } = ret
                    if (options.data) {
                        options.body = typeof options.data === 'object' ? JSON.stringify(options.data) : options.data
                        delete options.data
                    }
                    options.signal = controller.signal
                    args.timeout && setTimeout(() => controller.abort(), args.timeout)
                    result = await originalFetch(url, options)
                }
            }

            if (result.status === 200) {
                const res = await result.text()
                if (window.fetch.responseInterceptor) {
                    return window.fetch.responseInterceptor(res)
                }
                return res
            }
            return Promise.reject(result)
        }
    
    }
})(window.fetch)
