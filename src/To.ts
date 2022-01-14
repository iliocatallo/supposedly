export abstract class To<T, E> {
  static coerce<T, E>(value: any, to: To<T, E>) {
    return to.coerce(value)
  }

  protected abstract coerce(value: any): T | E
}

export const coerce = To.coerce
