import { test } from 'node:test'
import { equal, deepEqual } from 'node:assert/strict'
import fc, { assert, property } from 'fast-check'
import { null_ } from './null'
import { isValid } from './isValid'
import { explain } from './explain'

test(`null_ accepts null values`, function () {
  const res = isValid(null_, null)
  equal(res, true)
})

test(`null_ rejects all but null values`, function () {
  assert(
    property(notNull, (value) => {
      const res = isValid(null_, value)
      equal(res, false)
    })
  )
})

test(`there is an explanation why a value is not null`, function () {
  assert(
    property(notNull, (value) => {
      const exp = explain(null_, value)
      deepEqual(exp, {
        value,
        isNot: 'null',
      })
    })
  )
})

test(`there is no need for an explanation if the value is indeed null`, function () {
  const exp = explain(null_, null)
  equal(exp, undefined)
})

const fcSymbol = fc.string().map((str) => Symbol(str))
const fcNumber = fc.oneof(fc.integer(), fc.float(), fc.double())
const notNull = fc.oneof(fcNumber, fc.bigInt(), fc.boolean(), fc.string(), fc.constant(undefined), fcSymbol)
