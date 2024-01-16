import { describe, expect, expectTypeOf, test } from 'vitest'

import { t } from '../src'

describe('infer', () => {
  test('static', () => {
    const defineNumber = t.infer(t(Number))
    const number1 = defineNumber(1)
    expect(number1).toBe(1)
    expectTypeOf<typeof number1>().toEqualTypeOf<number>()
    // @ts-expect-error
    defineNumber('1')

    const defineNumberArray = t.infer(t.array(Number))
    const numberArray = defineNumberArray([1])
    expect(numberArray).toEqual([1])
    expectTypeOf<typeof numberArray>().toEqualTypeOf<number[]>()
    // @ts-expect-error
    defineNumberArray(['1'])

    const defineFunction = t.infer(t(Function, [Number], Number))
    const func = defineFunction(a => a)
    expect(func(1)).toBe(1)
    expectTypeOf<typeof func>().toEqualTypeOf<(a: number) => number>()
    // @ts-expect-error
    defineFunction(a => String(a))

    const defineGenericFunction = t.infer(t(Function, [t.generic('T')], t.generic('T')))
    const genericFunc = defineGenericFunction(a => a)
    const f0 = genericFunc(1)
    const f1 = genericFunc('1')
    expect(f0).toBe(1)
    expect(f1).toBe('1')
    expectTypeOf<typeof f0>().toEqualTypeOf<1>()
    expectTypeOf<typeof f1>().toEqualTypeOf<'1'>()
    // @ts-expect-error
    defineGenericFunction(a => String(a))

    // Can't check `GenericFunction` is equal to `<T extends any = never>(args_0: T) => T`,
    // maybe because of the generic magic type-level function.

    // type GenericFunc = <T extends any = never>(args_0: T) => T
    // type GenericFuncTypeof = typeof genericFunc
    // //   ^?
    // type T0 = [GenericFuncTypeof] extends [GenericFunc] ? true : false
    // //   ^?
    // type T1 = IsEqual<GenericFunc, GenericFuncTypeof>
    // //   ^?
    // type T2 = IsEqual<<T extends any = never>(args_0: T) => T, <T extends any = never>(args_0: T) => T>
    // //   ^?
    // expectTypeOf<GenericFunc>().toEqualTypeOf<GenericFuncTypeof>()
    // expectTypeOf(genericFunc).toEqualTypeOf<GenericFunc>()
  })
  test('passing schema and rerun itself', () => {
    const number = t(t(Number))
    expectTypeOf<typeof number>().toEqualTypeOf<t.Schema<NumberConstructor, number>>()
  })
  test('instance method', () => {
    const NumberSchema = t(Number)
    const number0 = NumberSchema.infer(0)
    expect(number0).toBe(0)
    expectTypeOf<typeof number0>().toEqualTypeOf<number>()
    // @ts-expect-error
    NumberSchema.infer('0')

    const literal0 = t(1)
    const number1 = literal0.infer(1)
    expect(number1).toBe(1)
    expectTypeOf<typeof number1>().toEqualTypeOf<1>()
    // @ts-expect-error
    literal0.infer(0)
    // @ts-expect-error
    literal0.infer('0')
  })
})

declare module '@typp/core' {
  namespace t {
    export const ____test_useStaticField0: string
    export const ____test_useStaticField1: string
    export const use_test: number
  }
}

describe('use', () => {
  test('base', () => {
    type tNamespace = typeof t
    const dispose = t.use(ctx => {
      const t = ctx
      expectTypeOf(t).toEqualTypeOf<tNamespace>()
      t.useStatic('____test_useStaticField0', '1')
      t.useStatic('____test_useStaticField1', '2')
    })
    expect(t.____test_useStaticField0).toBe('1')
    expect(t.____test_useStaticField1).toBe('2')
    dispose()
    expect(t).not.toHaveProperty('____test_useStaticField0')
    expect(t).not.toHaveProperty('____test_useStaticField1')
  })
  test('modifier', () => {
    const dispose = t.use(ctx => {
      const t = ctx
      t.useStatic('____test_useStaticField0', '1')
      t.useStatic.proxy('____test_useStaticField0', '____test_useStaticField1')
    })
    expect(t.____test_useStaticField0).toBe('1')
    expect(t.____test_useStaticField1).toBe('1')
    dispose()
    expect(t).not.toHaveProperty('____test_useStaticField0')
    expect(t).not.toHaveProperty('____test_useStaticField1')
  })
  test('throw error when useWhat is not a function', () => {
    const disposeStatic = t.useStatic('use_test', 1)
    expect(() => {
      t.use(ctx => {
        // @ts-expect-error
        ctx.use_test()
      })
    }).toThrow('You can\'t use plugin for typp, because the field "use_test" is not a function')
    disposeStatic()
  })
  test('nested use', () => {
    const dispose = t.use(ctx => {
      ctx.useStatic('____test_useStaticField0', '1')
      ctx.use(ctx => {
        ctx.useStatic('____test_useStaticField1', '2')
      })
    })
    expect(t.____test_useStaticField0).toBe('1')
    expect(t.____test_useStaticField1).toBe('2')
    dispose()
    expect(t).not.toHaveProperty('____test_useStaticField0')
    expect(t).not.toHaveProperty('____test_useStaticField1')
  })
})

describe('instance.use', () => {
  test('base', () => {
    //    _?
    const test = (reg: RegExp) => t.defineResolver(skm => {
      // @ts-ignore
      skm.meta.reg = reg
      return skm
    })
    const t0 = test(/.*/)
    //    ^?
    const t1 = t0(t.string())
    //    _?
    const skm = t
      .string()
      // _?
      .use(test(/.*/))
  })
})
