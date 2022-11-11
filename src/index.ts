// 尝试将字符串作为json字符串解析
function tryParseStringAsJson(val: string | null) {
  if (val == null) return val
  if (val.length < 2) return val
  const innerVal = val.trim()
  if (innerVal.length < 2) return val
  try {
    if (innerVal[0] === '{' && innerVal[innerVal.length - 1] === '}')
      return JSON.parse(innerVal)
  } catch (ex) {
    console.error(ex)
  }

  return val
}

function parseValue(keyPath: string[] = []) {
  if (!keyPath.length) return null
  const topLevelKey = keyPath[0]
  const resetKeyPath = keyPath.slice(1)

  const valueInLocal = tryParseStringAsJson(
    window.localStorage.getItem(topLevelKey)
  )

  if (resetKeyPath.length === 0) return valueInLocal

  if (valueInLocal && typeof valueInLocal === 'object') {
    return getValueByKeyPath(resetKeyPath, valueInLocal)
  } else {
    throw Error('获取不到值' + keyPath)
  }

  function getValueByKeyPath(innerkeyPath: string[], obj: object) {
    return innerkeyPath.reduce((res, curKey) => {
      return (res as any)[curKey]
    }, obj)
  }
}

// 怎么处理中间层级有值的情况？
function setValue(keyPath: string[], value: string) {
  const innerValue = value

  if (keyPath.length === 1) {
    window.localStorage.setItem(keyPath[0], innerValue)
    return
  }

  const firstKey = keyPath[0]

  let navtiveStorageValue = parseValue([firstKey])

  if (navtiveStorageValue == null) {
    navtiveStorageValue = {}
  } else if (typeof navtiveStorageValue !== 'object') {
    return
  }

  const resetKeys = keyPath.slice(1, -1)

  let curItem = navtiveStorageValue || {}

  for (var i = 0, len = resetKeys.length; i < len; i++) {
    if (curItem[resetKeys[i]] === undefined) {
      curItem[resetKeys[i]] = {}
    } // else {}
    curItem = curItem[resetKeys[i]]
  }

  const lastKey = keyPath[keyPath.length - 1]

  curItem[lastKey] = innerValue

  window.localStorage.setItem(keyPath[0], JSON.stringify(navtiveStorageValue))
}

interface WebStorage {
  (): void
  [index: string]: any
}

function factoryWebStorage(keyPath: string[] = []): WebStorage {
  let innerKeyPath = keyPath.slice()
  // eslint-disable-next-line
  return new Proxy((() => {}) as WebStorage, {
    get(target, propKey: string) {
      return factoryWebStorage([...innerKeyPath, propKey])
    },
    set(target, propKey: string, value) {
      // 重新格式化重新设置
      setValue([...innerKeyPath, propKey], value)
      return value
    },
    apply() {
      if (innerKeyPath.length === 0) return
      return parseValue([...innerKeyPath])
    },
  })
}

const smartWebStorage = factoryWebStorage()

export default smartWebStorage
