import webstorage from '../../src/index'

class LocalStorageMock {
  store: any

  constructor() {
    this.store = {}
  }

  clear() {
    this.store = {}
  }

  getItem(key: string) {
    return this.store[key] || null
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value)
  }

  removeItem(key: string) {
    delete this.store[key]
  }
}

Object.defineProperty(window, 'localStorage', { value: new LocalStorageMock() })

describe('正确性测试', () => {
  test('常规测试', () => {
    expect(webstorage.a()).toBe(null)
    webstorage.a = 1
    expect(webstorage.a()).toBe('1')
    // a1: '{"b": {"c": 1}}'
    expect((webstorage.a1.b.c = 1))
    expect(webstorage.a1.b.c()).toBe(1)
    expect(webstorage.a1.b()).toEqual({ c: 1 })
  })

  test('引用测试', () => {
    const a1 = webstorage.a1
    expect(a1()).toEqual({ b: { c: 1 } })
    expect(a1()).toEqual({ b: { c: 1 } })
    expect(a1.b()).toEqual({ c: 1 })
  })

  test('获取不到值', () => {
    expect(webstorage.b1.c1.e1()).toEqual(null)
    webstorage.b2 = JSON.stringify({ a: 1 })
    expect(webstorage.b2.b()).toEqual(undefined)
    expect(webstorage.b2.b.c()).toEqual(undefined)
  })

  test('proxy不兼容测试', () => {
    Object.defineProperty(window, 'Proxy', { value: undefined })
    // expect(webstorage.b1.c1.e1()).toEqual(() => {})
  })
})
