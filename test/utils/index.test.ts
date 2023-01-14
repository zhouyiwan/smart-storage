import webstorage, { sstorage } from '../../src/index'
import { SELF_KEYWORD } from '../../src/utils'

suit(webstorage, window.localStorage)
suit(sstorage, window.sessionStorage)

function suit(webstorage: any, storage: any) {
  afterEach(() => {
    storage.clear()
  })

  describe('self测试', () => {
    test('获取全部', () => {
      webstorage.a = { a: 1 }
      webstorage.b = 2
      webstorage.c = [1, 2]

      expect(webstorage[SELF_KEYWORD]()).toEqual({
        a: { a: 1 },
        b: '2',
        c: [1, 2],
      })

      expect(webstorage).toBe(webstorage[SELF_KEYWORD])
      expect(webstorage).toBe(
        webstorage[SELF_KEYWORD][SELF_KEYWORD][SELF_KEYWORD]
      )
    })

    test('删除全部', () => {
      webstorage.a = 1
      webstorage.b = 1
      delete webstorage[SELF_KEYWORD]
      expect(webstorage()).toEqual({})
    })

    test('非1级self', () => {
      webstorage.a = { a: 1 }
      webstorage.b = 1
      expect(webstorage.a[SELF_KEYWORD]()).toEqual({ a: 1 })
      expect(webstorage.b[SELF_KEYWORD]()).toEqual('1')

      delete webstorage.a[SELF_KEYWORD]
      expect(webstorage[SELF_KEYWORD]()).toEqual({ b: '1' })
    })

    test('self设置', () => {
      webstorage.a[SELF_KEYWORD] = { a: 1 }
      expect(webstorage.a[SELF_KEYWORD]()).toEqual({ a: 1 })
    })

    test('self设置object', () => {
      webstorage[SELF_KEYWORD] = { a: 1, b: { a: 1 } }
      expect(webstorage()).toEqual({ a: '1', b: { a: 1 } })
      expect(webstorage.a()).toEqual('1')
      expect(webstorage.b.a()).toEqual(1)
    })

    test('self设置数组', () => {
      webstorage[SELF_KEYWORD] = [1, { a: 1 }]
      expect(webstorage()).toEqual({ 0: '1', 1: { a: 1 } })
    })
  })

  describe('读取测试', () => {
    test('获取storage所有值 - 空', () => {
      expect(webstorage()).toEqual({})
    })

    test('获取storage所有值', () => {
      webstorage.fullValue1 = '{ "a": 1 }'
      webstorage.fullValue2 = '[{ "a": 1 }]'
      webstorage.fullValue3 = '1'

      expect(webstorage()).toEqual({
        fullValue1: { a: 1 },
        fullValue2: [{ a: 1 }],
        fullValue3: '1',
      })
    })

    test('测试数组字符串', () => {
      webstorage.a11 = JSON.stringify([{ a: 1 }])
      expect(webstorage.a11.a()).toBe(undefined)
      expect(webstorage.a11[0].a()).toBe(1)
    })

    test('引用测试', () => {
      webstorage.a1.b.c = 1

      const a1 = webstorage.a1
      expect(a1()).toEqual({ b: { c: 1 } })
      expect(a1()).toEqual({ b: { c: 1 } })
      expect(a1.b()).toEqual({ c: 1 })
    })
  })

  describe('写入测试', () => {
    test('常规测试', () => {
      webstorage.a11 = JSON.stringify([{ a: 1 }])
      webstorage.a1.b.c = 1

      expect(webstorage.a1()).toEqual({ b: { c: 1 } })
      expect(webstorage.a1.b()).toEqual({ c: 1 })
      expect(webstorage.a1.b.c()).toBe(1)
    })

    test('获取不到值', () => {
      expect(webstorage.b1.c1.e1()).toEqual(null)

      webstorage.b2 = JSON.stringify({ a: 1 })
      expect(webstorage.b2.b()).toEqual(undefined)
      expect(webstorage.b2.b.c()).toEqual(undefined)
      expect(webstorage.b3()).toEqual(null)
    })

    test('常规测试1', () => {
      expect(webstorage.a()).toBe(null)

      webstorage.a = 1
      expect(webstorage.a()).toBe('1')
    })

    test('设置对象', () => {
      webstorage.a = { a: 1, b: { c: 1 } }
      expect(webstorage.a.a()).toBe(1)
      expect(webstorage.a.b()).toEqual({ c: 1 })
      expect(webstorage.a.b.c()).toBe(1)

      webstorage.a = {}
      expect(webstorage.a.a()).toBe(undefined)
      expect(webstorage.a()).toEqual({})
    })
  })

  describe('删除测试', () => {
    test('删除数组子项', () => {
      webstorage.a = { a: 1, c: [0, 1] }
      delete webstorage.a.c[0]
      expect(webstorage()).toEqual({ a: { a: 1, c: [1] } })
    })

    test('删除', () => {
      webstorage.a = { a: 1, b: { c: 1 } }
      expect(webstorage.a.a()).toBe(1)
      delete webstorage.a.a
      expect(webstorage.a.a()).toBe(undefined)

      expect(webstorage()).toEqual({ a: { b: { c: 1 } } })
      delete webstorage[SELF_KEYWORD]
      expect(webstorage()).toEqual({})
    })

    test('删除一级属性', () => {
      webstorage.a1 = 1
      webstorage.a2 = 2
      delete webstorage.a1
      expect(webstorage.a1()).toBe(null)
      expect(webstorage.a2()).toBe('2')

      delete webstorage[SELF_KEYWORD]

      expect(webstorage()).toEqual({})
    })
  })

  describe('默认值测试', () => {
    test('默认值测试', () => {
      expect(webstorage.notfound.a(1)).toBe(1)
      expect(webstorage.notfound.a(() => 'notfound')).toBe('notfound')
    })
  })

  describe('异常测试', () => {
    test('setItem/getItem异常测试', () => {
      const localStoragePrototype = Object.getPrototypeOf(storage)
      const rawGetItem = localStoragePrototype.getItem
      const rawSetItem = localStoragePrototype.setItem

      localStoragePrototype.setItem = function () {
        throw new Error('1')
      }

      expect((webstorage.abc = 1)).toEqual(1)

      localStoragePrototype.getItem = function () {
        throw new Error('1')
      }

      expect(webstorage.abc()).toEqual(null)

      localStoragePrototype.setItem = rawSetItem
      localStoragePrototype.getItem = rawGetItem
    })

    // test('proxy不兼容测试', () => {
    //   Object.defineProperty(window, 'Proxy', { value: undefined })
    //   expect(webstorage.b1.c1.e1()).toEqual(() => {})
    // })
  })
}
