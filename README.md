# smart-web-storage

webStorage(localStorage/sessionStorage)中只能存取字符串，但是在很多情况下我们需要在一个key中存储JSON格式的数据，这时对JSON格式数据的读写就非常麻烦，需要：

1. 读取webStorage对应key的字符串值
2. 对字符串值进行解析
3. 获取对象对应key的值
4. 修改解析后的对象
5. 序列化对象为字符串
6. 将字符串写入webStorage中
7. 添加try..catch..防止读写出错

使用smart-web-storage可以通过操作对象属性的方式更加方便的对webStorage进行读写。

**注意：smart-web-storage库基于Proxy实现，所以需要浏览器环境支持Proxy。**

**注意：smart-web-storage不会将webStorage第一层的字符串作为JSON数据解析，a: 1，这里的1是字符串"1"，而不是数字1。boolean值同理a: true，"true"是字符串而不是boolean值。**

## 安装

```sh
npm install smart-web-storage
yarn add smart-web-storage
```

## 使用

```javascript
import lstorage, { sstorage } from 'smart-web-storage'
```

**注：lstorage表示localstorage, sstorage表示sessionStorage，两者用法相同。**

### 1. 正常使用

```javascript
// localStorage
// a: 1
lstorage.a() // '1'
lstorage.a = 2
// localStorage
// a: 2
lstorage.a() // '2'
lstorage.b.c = 1
// localStorage
// a: 2
// b: {"c": 1}
lstorage.b() // {c: 1}
lstorage.b.e = 2
lstorage.b() // {c: 1, e: 2}
lstorage.b.b() // undefined
lstorage.b.b.b() // undefined

// localStorage
// empty
lstorage.c = {c1: 1, c2: 2} 
// localStorage
// c: {"c1": 1, "c2": 2}
lstorage.c.c1() // 1
```

### 2. 获取不存在的localStorage值和使用默认值

```javascript
// localStorage值如下：
// a: 1
lstorage.notfound() // null

lstorage.notfound(1) // 1

lstorage.notfound((v) => 1) // 1
```

### 3. 删除值

```javascript
// localStorage
// c: {"c1": 1, "c2": 2}
delete lstorage.c.c1 
// localStorage
// c: {"c2": 2}
delete lstorage.self // 清楚localStorage所有值
// localStorage
// empty
```

### 4. 获取全部localStorage值

```javascript
// localStorage值如下：
// c: 1
// b: {"a": 1}
lstorage() // {c: "1", b: {a: 1}}
```

### 5. 设置全部localStorage值

```javascript
// localStorage
// empty
lstorage.self = {a: 1, b: {a: 1}} 
// localStorage
// a: 1
// b: {"a": 1}

// localStorage
// empty
lstorage.self = [1, {a: 1}] 
// localStorage
// 0: 1
// 1: {"a": 1}
```

**注意：webStorage的读取和写入都有失败风险，所以设置和读取都有可能出现意料之外的情况，虽然smartWebStoreage会兜底异常，但是异常后读取的值无法兜底需要用户手动处理。**

## License

[MIT](LICENSE.md)