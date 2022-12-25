import { getValue, DefaultValue } from './utils'

// 尝试将字符串作为json字符串解析
function tryParseStringAsJson(val: string | null) {
  if (val == null) return val
  if (val.length < 2) return val
  const innerVal = val.trim()
  if (innerVal.length < 2) return val
  try {
    const firstChar = innerVal[0]
    const lastChar = innerVal[innerVal.length - 1]
    if (
      (firstChar === '{' && lastChar === '}') ||
      (firstChar === '[' && lastChar == ']')
    )
      return JSON.parse(innerVal)
  } catch (ex) {
    console.error(ex)
  }

  return val
}

function getValueByPath(keyPath: string[] = []) {
  if (!keyPath.length) return null
  const firstKey = keyPath[0]
  const restKeyPath = keyPath.slice(1)

  let rawDataFromStorage = null

  try {
    rawDataFromStorage = window.localStorage.getItem(firstKey)
  } catch (ex) {
    return null
  }

  const valueInLocal = tryParseStringAsJson(rawDataFromStorage)

  return getValueByKeyPath(restKeyPath, valueInLocal)

  function getValueByKeyPath(innerkeyPath: string[], obj: object) {
    return innerkeyPath.reduce((res, curKey) => {
      if (res == null) return res
      return (res as any)[curKey]
    }, obj)
  }
}

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
      // if (innerKeyPath.length === 0) return
      return getValue(
        getValueByPath([...innerKeyPath]) as unknown as T,
        defaultValue
      ) as unknown as T | null | undefined
    },
  })
}

const smartWebStorage = factoryWebStorage()

export default smartWebStorage
