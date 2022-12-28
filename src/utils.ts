type DefaultValue<T = unknown, U = T> = ((v: T) => T) | U

function initialDefaultValue<T = unknown>(value: T): T {
  return value
}

function getValue<T>(
  value: T,
  defaultValue: DefaultValue<T> = initialDefaultValue
) {
  if (value != null) return value

  // @ts-ignore
  if (typeof defaultValue === 'function') return defaultValue(value)

  return defaultValue
}

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
    // 以下字符串都会导致JSON解析失败
    // JSON.parse('{a: 1}')
    // JSON.parse('[{a: 1}]')
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

function getFullLocalStorage() {
  const fullKeys = new Array(window.localStorage.length)
    .fill(1)
    .map((_item, index) => {
      return window.localStorage.key(index)
    })
    .filter((item) => item != null)

  return fullKeys.reduce<Record<string, any>>((result, key) => {
    result[key!] = getValueByPath([key!])
    return result
  }, {})
}

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

// 在报错情况下返回false
// 返回true只保证localStorage中没有该值，并不表示删除成功，有可能本来就没有这个值
function removeLocalStorageByPath(keyPath: string[]): boolean {
  if (keyPath.length === 0) return false
  if (keyPath.length === 1) {
    try {
      window.localStorage.removeItem(keyPath[0])
      return true
    } catch (ex) {
      console.error(ex)
      return false
    }
  }

  const parentValue = getValueByPath(keyPath.slice(0, -1))
  const deletedKey = keyPath[keyPath.length - 1]

  // 存在且是对象
  if (parentValue && typeof parentValue === 'object') {
    try {
      // @ts-ignore
      delete parentValue[deletedKey]
      // 这个有问题吧
      setValue(keyPath.slice(0, -1), JSON.stringify(parentValue))
      return true
    } catch (ex) {
      return false
    }
  }

  return true
}

export {
  getValue,
  tryParseStringAsJson,
  getValueByPath,
  getFullLocalStorage,
  setValue,
  removeLocalStorageByPath,
}
export type { DefaultValue }
