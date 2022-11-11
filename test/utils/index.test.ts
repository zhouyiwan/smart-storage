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

describe('正常', () => {
  test('获取', () => {
    expect(webstorage.a()).toBe(null)
    webstorage.a = 1
    expect(webstorage.a()).toBe('1')
    expect((webstorage.a1.b.c.d = 1))
    expect(webstorage.a1.b.c.d()).toBe(1)
  })
})
