type DefaultValue<T = unknown, U = T> = ((v: T) => T) | U

function initialDefaultValue<T = unknown>(value: T): T {
  return value
}

function getValue<T>(
  value: T,
  defaultValue: DefaultValue<T> = initialDefaultValue
) {
  if (value != null) return value

  // @ts-ignore
  if (typeof defaultValue === 'function') return defaultValue(value)

  return defaultValue
}

export { getValue }
export type { DefaultValue }
