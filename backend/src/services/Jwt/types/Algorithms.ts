// The use case was a RS256 key, but the jose package, could handle more. See:
// https://github.com/panva/jose/issues/210

export enum Algorithms {
  RS256 = 'RS256',
}
