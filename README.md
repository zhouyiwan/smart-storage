# smart-web-storage

让localstorage的读写更加方便。

## 安装

**注意：smart-web-storage库基于Proxy实现，所以需要浏览器环境支持Proxy。**

```sh
npm install smart-web-storage
yarn add smart-web-storage
```

## API

```javascript
// localstorage -> a: 1
import smartWebStorage from 'smart-web-storage'

try {
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
} catch (ex) {
  console.error(ex)
}
```

**注意：localstorage的读取和写入都有失败风险，所以需要try..catch..包裹，防止报错。并且对于获取值是否如预期也要做好容错处理。**

## License

[MIT](LICENSE.md)