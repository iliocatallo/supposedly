import { test } from 'uvu'
import assert from 'uvu/assert'
import { number } from './number'
import { string } from './string'
import { expectType } from 'ts-expect'
import { AtKey, InvalidType, MissingKey, Joint, coerceTo } from './coercion'
import { oneOf } from './oneOf'
import { boolean } from './boolean'
import { literal } from './literal'
import { object } from './object'

test(`oneOf allows specifying alternatives`, function () {
  const T = oneOf(string, object({ b: number }), boolean)

  const res1 = coerceTo(T, 'hello')
  const res2 = coerceTo(T, { b: 15 })
  const res3 = coerceTo(T, true)

  assert.is(res1, 'hello')
  assert.equal(res2, { b: 15 })
  assert.is(res3, true)

  type R =
    | string
    | boolean
    | { b: number }
    | Joint<[InvalidType, InvalidType, InvalidType | AtKey<InvalidType> | MissingKey]>
  expectType<R>(res1)
  expectType<R>(res2)
  expectType<R>(res3)
})

test(`oneOf rejects input values that are not coercible to any given alternative`, function () {
  const T = oneOf(literal('a'), literal('b'), literal('c'))

  const res1 = coerceTo(T, true)
  const res2 = coerceTo(T, { a: 2 })

  assert.equal(res1, new Joint([new InvalidType('a', true), new InvalidType('b', true), new InvalidType('c', true)]))
  assert.equal(
    res2,
    new Joint([new InvalidType('a', { a: 2 }), new InvalidType('b', { a: 2 }), new InvalidType('c', { a: 2 })])
  )

  type R = 'a' | 'b' | 'c' | Joint<[InvalidType, InvalidType, InvalidType]>
  expectType<R>(res1)
  expectType<R>(res2)
})

test(`oneOf reports the path at which the error happened`, function () {
  const stringOrNumberAtA = oneOf(string, object({ a: number }))

  const res1 = coerceTo(stringOrNumberAtA, { b: 12 })
  const res2 = coerceTo(stringOrNumberAtA, { a: 'hello' })

  assert.equal(res1, new Joint([new InvalidType('string', { b: 12 }), new MissingKey(['a'])]))
  assert.equal(
    res2,
    new Joint([new InvalidType('string', { a: 'hello' }), new AtKey(['a'], new InvalidType('number', 'hello'))])
  )

  type R = string | { a: number } | Joint<[InvalidType, InvalidType | AtKey<InvalidType> | MissingKey]>
  expectType<R>(res1)
  expectType<R>(res2)
})

test(`oneOf reports multi-level missing keys`, function () {
  const T = object({ a: oneOf(string, object({ b: number })) })

  const res1 = coerceTo(T, { b: 12 })
  const res2 = coerceTo(T, { a: { c: 12 } })

  assert.equal(res1, new MissingKey(['a']))
  assert.equal(res2, new Joint([new AtKey(['a'], new InvalidType('string', { c: 12 })), new MissingKey(['a', 'b'])]))

  type R =
    | InvalidType
    | MissingKey
    | { a: string | { b: number } }
    | Joint<[AtKey<InvalidType>, AtKey<InvalidType> | MissingKey]>
  expectType<R>(res1)
  expectType<R>(res2)
})

test.run()
