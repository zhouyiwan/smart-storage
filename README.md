# smart-web-storage

localStorage中只能存取字符串，但是在很多情况下我们需要在一个key中存储JSON格式的数据，这时对JSON格式数据的读取就会非常麻烦，需要parse之后读取再stringify之后再写入。smart-web-storage可以更加方便的读取localStorage中的JSON格式数据，读取的时候可以通过对象属性的形式获取对应值，写入的时候也是以对象属性形式写入。

**注意：smart-web-storage库基于Proxy实现，所以需要浏览器环境支持Proxy。**

**注意：smart-web-storage不会将localStorage第一层的字符串作为JSON数据解析，a: 1，这里的1是字符串"1"，而不是数字1。boolean值同理a: true，"true"是字符串而不是boolean值。**

## 安装

```sh
npm install smart-web-storage
yarn add smart-web-storage
```

## API

```javascript
import smartWebStorage from 'smart-web-storage'

// localstorage -> c: 1, b: {"a": 1}
smartWebStorage() // {c: 1, b: {a: 1}}

// 默认值
// 环境：localstorage -> a: 1
smartWebStorage.notfound() // null

smartWebStorage.notfound(1) // 1

smartWebStorage.notfound((v) => 1) // 1

// 添加全局数据
// 环境：localstorage -> 空
smartWebStorage._self = {a: 1, b: {a: 1}} // a: '1', b: {"a": 1}
// 环境：localstorage -> 空
smartWebStorage._self = [1, {a: 1}] // 0: '1', 1: {"a": 1}

// 正常使用
smartWebStorage.c = {c1: 1, c2: 2} // {"c": {"c1": 1, "c2": 2}}

smartWebStorage.c.c1() // 1

delete smartWebStorage.c.c1 // {"c": {"c2": 2}}

delete smartWebStorage._self // 清楚所有localStorage

smartWebStorage.a() // '1'

smartWebStorage.a = 2

smartWebStorage.a() // '2'

smartWebStorage.b.c = 1

smartWebStorage.b() // {c: 1}

smartWebStorage.b.e = 2

smartWebStorage.b() // {c: 1, e: 2}

smartWebStorage.b.b() // undefined

smartWebStorage.b.b.b() // undefined

smartWebStorage.b1() // null


```

**注意：localstorage的读取和写入都有失败风险，所以设置和读取都有可能出现意料之外的情况，虽然smartWebStoreage会兜底异常，但是异常后读取的值无法兜底需要用户手动处理。**

## License

[MIT](LICENSE.md)