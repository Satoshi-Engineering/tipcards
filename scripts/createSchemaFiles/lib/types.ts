
export function translateImportType(type: string) {
  switch(type) {
    case 'string':
      return 'varchar'

    case 'DateTime':
      return 'datetime'

    case 'integer':
      return 'int'

    default:
      return type
  }
}
export function translateImportTypes(array: string[]): string[] {
  return array.map(type => translateImportType(type))
}

export function createConfigForType(type: string) {
  switch(type) {
    case 'string':
      return ', { length: 256 }'

    default:
      return ''
  }
}
