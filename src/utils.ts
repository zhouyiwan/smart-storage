const SELF_KEYWORD = 'self'

// 清除storage
function clearStorage(storage: Storage) {
  try {
    storage.clear()
    return true
  } catch (ex) {
    return false
  }
}

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

// 来自: https://github.com/reduxjs/redux/blob/master/src/utils/isPlainObject.ts
function isPlainObject(obj: any): boolean {
  if (typeof obj !== 'object' || obj === null) return false

  let proto = obj
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto)
  }

  return Object.getPrototypeOf(obj) === proto
}

// 只会stringify{}和[]，其他类型数据原样返回
function stringifyValue(value: any): string {
  if (isPlainObject(value) || Array.isArray(value)) return JSON.stringify(value)
  return value
}

function getValueByPath(keyPath: string[] = [], storage: Storage) {
  if (!keyPath.length) return null
  const firstKey = keyPath[0]
  const restKeyPath = keyPath.slice(1)

  let rawDataFromStorage = null

  try {
    rawDataFromStorage = storage.getItem(firstKey)
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

function getFullLocalStorage(storage: Storage) {
  const fullKeys = new Array(storage.length)
    .fill(1)
    .map((_item, index) => {
      return storage.key(index)
    })
    .filter((item) => item != null)

  return fullKeys.reduce<Record<string, any>>((result, key) => {
    result[key!] = getValueByPath([key!], storage)
    return result
  }, {})
}

function setValue(keyPath: string[], value: any, storage: Storage) {
  if (keyPath.length === 1) {
    try {
      storage.setItem(keyPath[0], stringifyValue(value))
    } catch (ex) {
      console.error(ex)
      return false
    }
    return true
  }

  const firstKey = keyPath[0]

  let navtiveStorageValue = getValueByPath([firstKey], storage)

  if (navtiveStorageValue == null) {
    navtiveStorageValue = {}
  } else if (typeof navtiveStorageValue !== 'object') {
    console.error('不能设置基础值的属性')
    return false
  }

  // 这里不包含最后一个key--------------v
  const resetKeys = keyPath.slice(1, -1)

  let curItem: { [index: string]: any } = navtiveStorageValue || {}

  for (var i = 0, len = resetKeys.length; i < len; i++) {
    if (curItem[resetKeys[i]] === undefined) {
      curItem[resetKeys[i]] = {}
    }
    curItem = curItem[resetKeys[i]]
  }

  const lastKey = keyPath[keyPath.length - 1]

  curItem[lastKey] = value

  try {
    storage.setItem(keyPath[0], JSON.stringify(navtiveStorageValue))
    return true
  } catch (ex) {
    return false
  }
}

function isStringNumber(str: string): boolean {
  if (isNaN(+str)) return false
  return true
}

// 在报错情况下返回false
// 返回true只保证localStorage中没有该值，并不表示删除成功，有可能本来就没有这个值
function removeLocalStorageByPath(
  keyPath: string[],
  storage: Storage
): boolean {
  if (keyPath.length === 0) return false
  if (keyPath.length === 1) {
    try {
      storage.removeItem(keyPath[0])
      return true
    } catch (ex) {
      console.error(ex)
      return false
    }
  }

  let parentValue = getValueByPath(keyPath.slice(0, -1), storage)
  const deletedKey = keyPath[keyPath.length - 1]

  // 存在且是对象
  if (parentValue && typeof parentValue === 'object') {
    try {
      if (isStringNumber(deletedKey) && Array.isArray(parentValue)) {
        parentValue = parentValue.filter((item, index) => index !== +deletedKey)
      } else {
        // @ts-ignore
        delete parentValue[deletedKey]
      }
      // 这个有问题吧
      setValue(keyPath.slice(0, -1), parentValue, storage)
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
  clearStorage,
  isPlainObject,
  SELF_KEYWORD,
}
export type { DefaultValue }
