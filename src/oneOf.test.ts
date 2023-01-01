import { test } from 'uvu'
import assert from 'uvu/assert'
import { number } from './number'
import { string } from './string'
import { oneOf } from './oneOf'
import { boolean } from './boolean'
import { literal } from './literal'
import { object } from './object'
import { coerceTo } from './coercion'
import { AtKey, explain } from './explain'

test(`oneOf allows specifying alternatives`, function () {
  const T = oneOf(string, object({ b: number }), boolean)

  const res1 = coerceTo(T, 'hello')
  const res2 = coerceTo(T, { b: 15 })
  const res3 = coerceTo(T, true)

  assert.is(res1, 'hello')
  assert.equal(res2, { b: 15 })
  assert.is(res3, true)
})

test(`oneOf rejects input values that are not coercible to any given alternative`, function () {
  const T = oneOf(literal('a'), literal('b'), literal('c'))

  const res1 = coerceTo(T, true)
  const res2 = coerceTo(T, { a: 2 })

  assert.is(res1, undefined)
  assert.is(res2, undefined)
})

test(`there is an explanation if the input value is not coercibile to any given alternative`, function () {
  const T = oneOf(literal('a'), literal('b'), literal('c'))

  const why1 = explain(T, true)
  const why2 = explain(T, { a: 2 })

  assert.equal(why1, {
    value: true,
    not: { oneOf: [{ literal: 'a' }, { literal: 'b' }, { literal: 'c' }] },
    cause: [
      { value: true, not: { literal: 'a' } },
      { value: true, not: { literal: 'b' } },
      { value: true, not: { literal: 'c' } },
    ],
  })
  assert.equal(why2, {
    value: { a: 2 },
    not: { oneOf: [{ literal: 'a' }, { literal: 'b' }, { literal: 'c' }] },
    cause: [
      { value: { a: 2 }, not: { literal: 'a' } },
      { value: { a: 2 }, not: { literal: 'b' } },
      { value: { a: 2 }, not: { literal: 'c' } },
    ],
  })
})

test(`oneOf reports the path at which the error happened`, function () {
  const stringOrNumberAtA = oneOf(string, object({ a: number }))

  const res1 = coerceTo(stringOrNumberAtA, { b: 12 })
  const res2 = coerceTo(stringOrNumberAtA, { a: 'hello' })

  assert.is(res1, undefined)
  assert.is(res2, undefined)
})

test(`the explanation mentions the path at which the error happened`, function () {
  const stringOrNumberAtA = oneOf(string, object({ a: number }))

  const why1 = explain(stringOrNumberAtA, { b: 12 })
  const why2 = explain(stringOrNumberAtA, { a: 'hello' })

  assert.equal(why1, {
    value: { b: 12 },
    not: { oneOf: ['string', { object: { a: 'number' } }] },
    cause: [{ value: { b: 12 }, not: 'string' }, { missingKey: ['a'] }],
  })
  assert.equal(why2, {
    value: { a: 'hello' },
    not: { oneOf: ['string', { object: { a: 'number' } }] },
    cause: [{ value: { a: 'hello' }, not: 'string' }, new AtKey(['a'], { value: 'hello', not: 'number' })],
  })
})

test(`oneOf reports multi-level missing keys`, function () {
  const T = object({ a: oneOf(string, object({ b: number })) })

  const res1 = coerceTo(T, { b: 12 })
  const res2 = coerceTo(T, { a: { c: 12 } })

  assert.is(res1, undefined)
  assert.is(res2, undefined)
})

test(`there is an explanation in case of multi-level missing keys`, function () {
  const T = object({ a: oneOf(string, object({ b: number })) })

  const why1 = explain(T, { b: 12 })
  const why2 = explain(T, { a: { c: 12 } })

  assert.equal(why1, {
    value: { b: 12 },
    not: { object: { a: { oneOf: ['string', { object: { b: 'number' } }] } } },
    cause: [{ missingKey: ['a'] }],
  })
  assert.equal(why2, {
    value: { a: { c: 12 } },
    not: { object: { a: { oneOf: ['string', { object: { b: 'number' } }] } } },
    cause: [new AtKey(['a'], { value: { c: 12 }, not: 'string' }), { missingKey: ['a', 'b'] }],
  })
})

test.run()
