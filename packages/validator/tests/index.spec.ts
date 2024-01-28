import { t } from '@typp/core'
import { beforeAll, describe, expect, expectTypeOf, test } from 'vitest'

import validator, { ValidateError } from '../src'

beforeAll(() => t.use(validator))

describe('parse', () => {
  test('base', () => {
    const NumberSchema = t.number()
    const a = NumberSchema.validate(1)
    expect(a).toBe(1)
    expectTypeOf(a).toEqualTypeOf<number>()
    const b = NumberSchema.validate.narrow(1)
    expect(b).toBe(1)
    expectTypeOf(b).toEqualTypeOf<1>()
  })
  test('unexpected', () => {
    const NumberSchema = t.number()
    // @ts-expect-error
    expect(() => NumberSchema.validate('a')).toThrow(ValidateError)
    // @ts-expect-error
    expect(() => NumberSchema.validate.narrow('a')).toThrow(ValidateError)
  })
  test('tryParse', () => {
    const NumberSchema = t.number()
    const result0 = NumberSchema.tryValidate(1)
    expect(result0.success).toBe(true)
    expect(result0.data).toBe(1)
    expectTypeOf(result0).toEqualTypeOf<t.ValidateSuccess<number>>()

    const result1 = NumberSchema.tryValidate('a')
    expect(result1.success).toBe(false)
    expect(result1.error).toBeInstanceOf(ValidateError)
    expectTypeOf(result1).toEqualTypeOf<t.ValidateError>()

    const result2 = NumberSchema.tryValidate({} as any)
    expectTypeOf(result2).toEqualTypeOf<t.ValidateResult<number>>()
    if (result2.success) {
      expectTypeOf(result2).toEqualTypeOf<t.ValidateSuccess<number>>()
    } else {
      expectTypeOf(result2).toEqualTypeOf<t.ValidateError>()
      expect(result2.success).toBe(false)
      expect(result2.error).toBeInstanceOf(ValidateError)
    }

    const result3 = NumberSchema.tryValidate({} as unknown)
    expectTypeOf(result3).toEqualTypeOf<t.ValidateResult<number>>()
    if (result3.success) {
      expectTypeOf(result3).toEqualTypeOf<t.ValidateSuccess<number>>()
    } else {
      expectTypeOf(result3).toEqualTypeOf<t.ValidateError>()
      expect(result3.error).toBeInstanceOf(ValidateError)
    }
    expect(result2.success).toBe(false)
  })
  describe('primitive', () => {
    describe('number', () => {
      test('base', () => {
        const r0 = t.number().validate(1)
        expect(r0).toBe(1)
        expectTypeOf(r0).toEqualTypeOf<number>()
      })
      test('NaN', () => {
        const r0 = t.number().validate(NaN)
        expect(r0).toBeNaN()
        expectTypeOf(r0).toEqualTypeOf<number>()
        const r1 = t.number().validate('NaN')
        expect(r1).toBeNaN()
        expectTypeOf(r1).toEqualTypeOf<number>()
      })
      test('Infinity', () => {
        const r0 = t.number().validate(Infinity)
        expect(r0).toBe(Infinity)
        expectTypeOf(r0).toEqualTypeOf<number>()
        const r1 = t.number().validate(-Infinity)
        expect(r1).toBe(-Infinity)
        expectTypeOf(r1).toEqualTypeOf<number>()
      })
      test('unexpected', () => {
        const skm = t.number()
        expect(() => {
          // @ts-expect-error
          skm.validate('abc')
        }).toThrow(new ValidateError('unexpected', skm, '1'))
      })
    })
  })
})
describe('validate', () => {
})
