import { test } from 'uvu'
import { is, equal } from 'uvu/assert'
import fc, { assert, property } from 'fast-check'
import { expectType } from 'ts-expect'
import { number } from './number'
import { coerceTo, InvalidType } from './coercion'

test(`number accepts number values`, function () {
  assert(
    property(fcNumber, (value) => {
      const res = coerceTo(number, value)

      expectType<number | InvalidType>(res)
      is(res, value)
    })
  )
})

test('number rejects all but number values', function () {
  assert(
    property(notANumber, (value) => {
      const res = coerceTo(number, value)

      expectType<number | InvalidType>(res)
      equal(res, new InvalidType('number', value))
    })
  )
})

test.run()

const fcSymbol = fc.string().map((str) => Symbol(str))
const fcNumber = fc.oneof(fc.integer(), fc.float(), fc.double())
const notANumber = fc.oneof(fc.string(), fc.boolean(), fc.constant(null), fc.constant(undefined), fcSymbol)
