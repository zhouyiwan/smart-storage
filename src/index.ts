import {
  getValue,
  DefaultValue,
  getValueByPath,
  getFullLocalStorage,
} from './utils'

// 怎么处理中间层级有值的情况？
function setValue(keyPath: string[], value: string) {
  const innerValue = value

  if (keyPath.length === 1) {
    try {
      window.localStorage.setItem(keyPath[0], innerValue)
    } catch (ex) {
      console.error(ex)
      return false
    }
    return true
  }

  const firstKey = keyPath[0]

  let navtiveStorageValue = getValueByPath([firstKey])

  if (navtiveStorageValue == null) {
    navtiveStorageValue = {}
  } else if (typeof navtiveStorageValue !== 'object') {
    console.error('不能设置基础值的属性')
    return false
  }

  const resetKeys = keyPath.slice(1, -1)

  let curItem: { [index: string]: any } = navtiveStorageValue || {}

  for (var i = 0, len = resetKeys.length; i < len; i++) {
    if (curItem[resetKeys[i]] === undefined) {
      curItem[resetKeys[i]] = {}
    }
    curItem = curItem[resetKeys[i]]
  }

  const lastKey = keyPath[keyPath.length - 1]

  curItem[lastKey] = innerValue

  try {
    window.localStorage.setItem(keyPath[0], JSON.stringify(navtiveStorageValue))
    return true
  } catch (ex) {
    return false
  }
}

interface WebStorage<T = any> {
  (defaultVale?: DefaultValue<T>): T
  // TOFIX: 类型不确定
  [index: string]: any
}

function factoryWebStorage(keyPath: string[] = []): WebStorage {
  if (typeof Proxy === 'undefined') {
    console.error('Proxy is not defined')
    return function _() {
      return _
    } as any
  }

  let innerKeyPath = keyPath.slice()
  // eslint-disable-next-line
  return new Proxy((() => { }) as unknown as WebStorage, {
    get(target, propKey: string) {
      /**
       * 返回一个新的proxy实例，支持以下用法：
       * const cache = webstorage.a;
       * cache.b;
       * webstorage.a
       * 如果公用一个实例，key push进入数组后就退不出来了
       */
      return factoryWebStorage([...innerKeyPath, propKey])
    },
    set(target, propKey: string, value) {
      // 重新格式化重新设置
      setValue([...innerKeyPath, propKey], value)
      return true
    },
    // 如果获取的值不存在怎么办？
    // @ts-ignore
    apply<T = unknown>(target, self, [defaultValue]) {
      if (innerKeyPath.length === 0) return getFullLocalStorage()
      return getValue(
        getValueByPath([...innerKeyPath]) as unknown as T,
        defaultValue
      ) as unknown as T | null | undefined
    },
  })
}

const smartWebStorage = factoryWebStorage()

export default smartWebStorage
