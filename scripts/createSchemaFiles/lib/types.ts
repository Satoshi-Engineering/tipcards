
const enums = {}

export function parseEnums(enumDefinitions) {
  enumDefinitions.forEach(enumDefinition => {
    enums[enumDefinition.name] = enumDefinition.values.map(value => value.name)
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

export function createConfigForType(type: string) {
  if (type.startsWith('varchar')) return `, { length: ${type.match(/(?<=\().+?(?=\))/)[0]} }`

  if (type in enums) {
    return `, ['${enums[type].join('\', \'')}']`
  }

  return ''
}
