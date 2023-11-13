
const enums = {}

export function parseEnums(enumDefinitions) {
  enumDefinitions.forEach(enumDefinition => {
    enums[enumDefinition.name] = enumDefinition.values
  })
}

export function translateImportType(type: string) {
  if (type === 'text') return 'text'
  if (type === 'DateTime') return 'datetime'
  if (type === 'integer') return 'int'
  if (type === 'boolean') return 'boolean'

  if (type.startsWith('varchar')) return 'varchar'
  if (type in enums) return 'mysqlEnum'

  throw new Error(`Type ${type} not translated`)
}

export function translateImportTypes(array: string[]): string[] {
  return array.map(type => translateImportType(type))
}

export function getEnums(array: string[]): string[] {
  return array.filter(type => type in enums)
}

export function getEnumValueDefinitions(enumName: string): { name:string, note:string }[] {
  return enums[enumName]
}

export function createConfigForType(type: string) {
  if (type.startsWith('varchar')) return `, { length: ${type.match(/(?<=\().+?(?=\))/)[0]} }`

  if (type in enums) {
    return `, ${type}`
  }

  return ''
}
