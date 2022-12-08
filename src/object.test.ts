import { test } from 'uvu'
import assert from 'uvu/assert'
import { AtKey, InvalidCoercion } from './InvalidCoercion'
import { MissingKey } from './MissingKey'
import { number } from './v4/Type'
import { object } from './v4/Type'
import { string } from './v4/Type'
import { coerceTo } from './v4/coerceTo'
import { expectType } from 'ts-expect'

test(`object succeeds if the input data is an object adhering to the expectations`, function () {
  const Point = object({ x: string, y: number })

  const res = coerceTo(Point, { x: 'hello', y: 12 })

  assert.equal(res, { x: 'hello', y: 12 })

  type R = { x: string; y: number } | InvalidCoercion | AtKey<InvalidCoercion> | MissingKey
  expectType<R>(res)
})

test(`object fails if the input data is not an object`, function () {
  const Point = object({ x: string, y: number })

  const res = coerceTo(Point, 'hello')

  assert.equal(res, new InvalidCoercion('object', 'hello'))

  type R = { x: string; y: number } | InvalidCoercion | AtKey<InvalidCoercion> | MissingKey
  expectType<R>(res)
})

test(`object rejects the input data upon the first missing element`, function () {
  const Point = object({ x: string, y: number })

  const res = coerceTo(Point, { x: 'hello' })

  assert.equal(res, new MissingKey(['y']))

  type R = { x: string; y: number } | InvalidCoercion | AtKey<InvalidCoercion> | MissingKey
  expectType<R>(res)
})

test(`object rejects the input data upon the first mismatching element`, function () {
  const Point = object({ x: string, y: number })

  const res = coerceTo(Point, { x: 'hello', y: false })

  assert.equal(res, new AtKey(['y'], new InvalidCoercion('number', false)))

  type R = { x: string; y: number } | InvalidCoercion | AtKey<InvalidCoercion> | MissingKey
  expectType<R>(res)
})

test(`object marks optional fields by ending keys with ?`, function () {
  const obj = object({ 'x?': string, y: number })

  const res1 = coerceTo(obj, { x: 'hello', y: 20 })
  const res2 = coerceTo(obj, { x: undefined, y: 20 })
  const res3 = coerceTo(obj, { y: 20 })

  assert.equal(res1, { x: 'hello', y: 20 })
  assert.equal(res2, { x: undefined, y: 20 })
  assert.equal(res3, { y: 20 })

  type R = { x?: string; y: number } | InvalidCoercion | AtKey<InvalidCoercion> | MissingKey
  expectType<R>(res1)
  expectType<R>(res2)
  expectType<R>(res3)
})

test.run()
