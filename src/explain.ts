import { CoercionError, InvalidType, MissingKey, scope } from './coercion'
import {
  isLiteralSchema,
  isObjectSchema,
  isPrimitiveSchema,
  LiteralSchema,
  ObjectSchema,
  PrimitiveSchema,
  Schema,
  Type,
} from './Type'

export function explain<R>(type: Type<R>, value: any): WhyValueIsNot<R> | undefined {
  const { schema } = type
  return explainSchema(schema, value)
}

function explainSchema(schema: Schema, value: any): any {
  if (isPrimitiveSchema(schema)) {
    return explainPrimitive(schema, value)
  }
  if (isLiteralSchema(schema)) {
    return explainLiteral(schema, value)
  }
  if (isObjectSchema(schema)) {
    return explainObject(schema, value)
  }
  throw new Error(`Not yet implemented: ${schema} against ${value}`)
}

function explainPrimitive(schema: PrimitiveSchema, value: any): any {
  if (typeof value === schema) {
    return undefined
  }
  return {
    value,
    not: schema,
    cause: [new InvalidType(schema, value)],
  }
}

function explainLiteral(schema: LiteralSchema, value: any): any {
  if (schema.literal === value) {
    return undefined
  }
  return {
    value,
    not: schema,
    cause: [new InvalidType(`${schema.literal}`, value)],
  }
}

function explainObject(schema: ObjectSchema, value: any): any {
  if (typeof value !== 'object') {
    return {
      value,
      not: schema,
      cause: [new InvalidType('object', value)],
    }
  }
  const objectSchema = schema.object
  const cause: CoercionError[] = []
  for (let [key, schemaAtKey] of Object.entries(objectSchema)) {
    const optional = key.endsWith('?')
    key = optional ? key.slice(0, -1) : key

    if (optional && !value.hasOwnProperty(key)) continue
    if (optional && value[key] === undefined) continue
    if (!optional && value[key] === undefined) {
      cause.push(new MissingKey([key]))
      continue
    }

    const why = explainSchema(schemaAtKey, value[key])
    if (!why) continue

    cause.push(...why.cause.map((c: CoercionError) => scope([key], c)))
  }
  return (cause.length === 0) ? undefined : { value, not: schema, cause }
}

interface WhyValueIsNot<_R> {
  value: any
  not: Not
  cause: CoercionError[]
}

type Not = Schema
