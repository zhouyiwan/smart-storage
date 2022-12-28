import {
  getValue,
  DefaultValue,
  getValueByPath,
  setValue,
  getFullLocalStorage,
  removeLocalStorageByPath,
} from './utils'

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
    // 如果设置的是对象呢？例如：a.b = {c: 1}
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
    deleteProperty(target, propKey: string) {
      if (innerKeyPath.length === 0) {
        try {
          window.localStorage.clear()
          return true
        } catch (ex) {
          return false
        }
      } else return removeLocalStorageByPath([...innerKeyPath, propKey])
    },
  })
}

const smartWebStorage = factoryWebStorage()

export default smartWebStorage
