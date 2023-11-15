import { translateDrizzleObjectName, translateFileName, translateSQLTableName, translateTypeName } from './translateNames'
import { DBMLField, DBMLSchema, DBMLTable } from './types'
import { createConfigForType, getEnums, getEnumValueDefinitions, translateImportType, translateImportTypes, getDefault, parseEnums } from './translateTypes'
import { uniqueArray } from './tools.array'
import { getReferences } from './references'


export class SchemaCreator {
  schema: DBMLSchema

  constructor(schema: DBMLSchema) {
    this.schema = schema

    parseEnums(schema)
  }

  createFieldEntry(tableName: string, field: DBMLField) {
    const config = createConfigForType(field.type.type_name)

    let line = `${field.name}: `
    line+=`${translateImportType(field.type.type_name)}('${field.name}'${config})`
    if (field.pk === true) line += '.primaryKey()'
    if (field.unique === true) line += '.unique()'
    if (field.not_null === undefined || field.not_null === true) line += '.notNull()'
    if (field.dbdefault !== undefined) line += getDefault(field.dbdefault)
    line += getReferences(this.schema, tableName, field.name)

    return line
  }

  getImports(tableName: string) {
    const imports: string[] = []

    this.schema.refs.forEach(ref => {
      const endpoints = ref.endpoints
      if (endpoints[1].tableName === tableName && (endpoints[1].relation === '1' || endpoints[1].relation === '*')) {
        imports.push(endpoints[0].tableName)
      }
    })

    return imports
  }

  public create(table: DBMLTable) {
    const tableName = translateSQLTableName(table.name)
    const drizzleName = translateDrizzleObjectName(table.name)
    const typeName = translateTypeName(table.name)

    const fields = table.fields.map(field => field.type.type_name)
    const imports = this.getImports(table.name)
    const enums = getEnums(fields)
    const indexes = table.indexes

    let fileData = ''

    // Imports
    let usedTypes = translateImportTypes(fields)
    usedTypes = uniqueArray(usedTypes)
    if (indexes.length > 0) usedTypes.unshift('primaryKey')
    usedTypes.unshift('mysqlTable')

    fileData = `import { ${usedTypes.join(', ')} } from 'drizzle-orm/mysql-core'\n`
    imports.forEach(table => {
      fileData += `import { ${translateDrizzleObjectName(table)} } from './${translateFileName(table)}'\n`
    })
    fileData+= '\n'

    // Enums
    enums.forEach(enumType => {
      fileData += `const ${enumType}: [string, ...string[]] = [\n`
      getEnumValueDefinitions(enumType).forEach(enumValueDef => {
        fileData += `  '${enumValueDef.name}',${enumValueDef.note ? ` // Note: ${enumValueDef.note}`: ''}\n`
      })
      fileData += ']\n'
      fileData += '\n'
    })

    // Fields
    fileData+= `export const ${drizzleName} = mysqlTable('${tableName}', {\n`
    table.fields.forEach(field => {
      fileData += `  ${this.createFieldEntry(table.name, field)},${field.note ? ` // Note: ${field.note}` : ''}\n`
    })

    // Indexes
    if (indexes.length <= 0) {
      fileData += '})\n'
    } else {
      fileData += '}, (table) => {\n'
      fileData += '  return {\n'
      indexes.forEach(index => {
        const columns = index.columns.map(column => column.value)
        fileData += `    pk: primaryKey({ columns: [table.${columns.join(', table.')}] }),\n`
      })
      fileData += '  }\n'
      fileData += '})\n'
    }
    fileData+= '\n'
    fileData+= `export type ${typeName} = typeof ${drizzleName}.$inferSelect\n`

    return fileData
  }
}
