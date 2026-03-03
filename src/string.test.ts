import { test } from 'node:test'
import { equal, deepEqual } from 'node:assert/strict'
import fc, { assert, property } from 'fast-check'
import { string } from './string'
import { isValid } from './isValid'
import { explain } from './explain'

test(`string accepts string values`, function () {
  assert(
    property(fc.string(), (value) => {
      const res = isValid(string, value)
      equal(res, true)
    })
  )
})

test(`string rejects all but string values`, function () {
  assert(
    property(notAString, (value) => {
      const res = isValid(string, value)
      equal(res, false)
    })
  )
})

test(`there is an explanation why a value is not a string`, function () {
  assert(
    property(notAString, (value) => {
      const exp = explain(string, value)
      deepEqual(exp, {
        value,
        isNot: 'string',
      })
    })
  )
})

test(`there is no need for an explanation if the value is indeed a string`, function () {
  assert(
    property(fc.string(), (value) => {
      const exp = explain(string, value)
      equal(exp, undefined)
    })
  )
})

const fcSymbol = fc.string().map((str) => Symbol(str))
const fcNumber = fc.oneof(fc.integer(), fc.float(), fc.double())
const notAString = fc.oneof(fcNumber, fc.boolean(), fc.constant(null), fc.constant(undefined), fcSymbol)
