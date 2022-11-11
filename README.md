# smart-web-storage

让localstorage的读写更加方便。

## 安装

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
} catch (ex) {
  console.error(ex)
}
```

## License

[MIT](LICENSE.md)