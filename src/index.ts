import {
  getValue,
  DefaultValue,
  getValueByPath,
  setValue,
  getFullLocalStorage,
  removeLocalStorageByPath,
  clearStorage,
  isPlainObject,
  SELF_KEYWORD,
} from './utils'

interface WebStorage<T = any> {
  (defaultVale?: DefaultValue<T>): T
  // TOFIX: 类型不确定
  [index: string]: any
}

function factoryWebStorage(
  keyPath: string[] = [],
  storage: Storage = window.localStorage
): WebStorage {
  if (typeof Proxy === 'undefined') {
    console.error('Proxy is not defined')
    return function _() {
      return _
    } as any
  }

  let innerKeyPath = keyPath.slice()
  // eslint-disable-next-line
  return new Proxy((() => { }) as unknown as WebStorage, {
    get(target, propKey: string, receiver) {
      if (propKey === SELF_KEYWORD) return receiver
      /**
       * 返回一个新的proxy实例，支持以下用法：
       * const cache = webstorage.a;
       * cache.b;
       * webstorage.a
       * 如果公用一个实例，key push进入数组后就退不出来了
       */
      return factoryWebStorage([...innerKeyPath, propKey], storage)
    },
    // 如果设置的是对象呢？例如：a.b = {c: 1}
    set(target, propKey: string, value) {
      // 支持：webstorage = {a: 1}
      if (!propKey && innerKeyPath.length === 0) return setFullStorage(value)

      if (propKey === SELF_KEYWORD) {
        if (innerKeyPath.length === 0) {
          return setFullStorage(value)
        } else {
          setValue(innerKeyPath, value, storage)
        }
      } else {
        // 重新格式化重新设置
        setValue([...innerKeyPath, propKey], value, storage)
      }

      return true

      function setFullStorage(value: any) {
        if (isPlainObject(value)) {
          Object.keys(value).forEach((key: string) => {
            setValue([key], value[key], storage)
          })
        } else if (Array.isArray(value)) {
          value.forEach((item, key) => {
            setValue([key.toString()], item, storage)
          })
        } else {
          console.error('')
          return false
        }
        return true
      }
    },
    // 如果获取的值不存在怎么办？
    // @ts-ignore
    apply<T = unknown>(target, self, [defaultValue]) {
      if (innerKeyPath.length === 0) return getFullLocalStorage(storage)
      return getValue(
        getValueByPath([...innerKeyPath], storage) as unknown as T,
        defaultValue
      ) as unknown as T | null | undefined
    },
    // TOFIX: 如果删除的是数组let a = [1, 2]; delete a[0] --> [empty, 2]
    deleteProperty(target, propKey: string) {
      // 引入self表示当前代理对象自己是因为delete webstorage会报错
      // 严格模式下delete需要删除属性引用，不能直接删除标识符
      if (!propKey) return clearStorage(storage)

      if (propKey === SELF_KEYWORD) {
        if (innerKeyPath.length === 0) return clearStorage(storage)
        return removeLocalStorageByPath(innerKeyPath, storage)
      }

      return removeLocalStorageByPath([...innerKeyPath, propKey], storage)
    },
  })
}

const lstorage = factoryWebStorage([], window.localStorage)

const sstorage = factoryWebStorage([], window.sessionStorage)

export { lstorage, sstorage }

export default lstorage
