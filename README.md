# Fetch-data
通过对 原生fetch api进行封装，使之达到 axios 请求的功能及使用上的一致性


1. 抹平请求方式的差异
2. 响应超时功能(终止请求)
3. 对不同响应数据的转化 --> 目前只转化字符串
4. Fetch 拦截器

## 使用
```html
<script src="./fetch.js"></script>
<script>
    // 请求拦截
    fetch.requestInterceptor = config => {
        config.headers = { 'Content-type': 'application/json', token: 123 }
        config.timeout = 100
        return config
    }
  
    // 响应拦截
    fetch.responseInterceptor = response => {
        return response
    }
  
    fetch({
        url: '/indexdf.html',
        timeout: 10,
        method: 'post',
        data: {abc: 123}
    }).then(res => {
        console.log(res);
    }).catch(err => {
        console.log(err)
    })
</script>
```
