export const findAsyncSequential = async <T>(
  values: T[],
  predicate: (value: T) => Promise<boolean>,
): Promise<T | null> => {
  for (const value of values) {
    if (await predicate(value)) {
      return value
    }
  }
  return null
}
