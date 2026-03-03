import { test } from 'node:test'
import { equal, deepEqual } from 'node:assert/strict'
import fc, { assert, property } from 'fast-check'
import { isValid } from './isValid'
import { explain } from './explain'
import { boolean } from './boolean'

test(`boolean accepts boolean values`, function () {
  assert(
    property(fc.boolean(), (value) => {
      const res = isValid(boolean, value)
      equal(res, true)
    })
  )
})

test(`boolean rejects all but boolean values`, function () {
  assert(
    property(notABoolean, (value) => {
      const res = isValid(boolean, value)
      equal(res, false)
    })
  )
})

test(`there is an explanation why a value is not a boolean`, function () {
  assert(
    property(notABoolean, (value) => {
      const exp = explain(boolean, value)
      deepEqual(exp, {
        value,
        isNot: 'boolean',
      })
    })
  )
})

test(`there is no need for an explanation if the value is indeed a boolean`, function () {
  assert(
    property(fc.boolean(), (value) => {
      const exp = explain(boolean, value)
      equal(exp, undefined)
    })
  )
})

const fcSymbol = fc.string().map((str) => Symbol(str))
const fcNumber = fc.oneof(fc.integer(), fc.float(), fc.double())
const notABoolean = fc.oneof(fcNumber, fc.bigInt(), fc.string(), fc.constant(null), fc.constant(undefined), fcSymbol)
