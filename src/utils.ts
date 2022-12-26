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

export { getValue, tryParseStringAsJson, getValueByPath, getFullLocalStorage }
export type { DefaultValue }
