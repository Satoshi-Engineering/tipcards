import {
  translateDrizzleObjectName,
  translateEnumName,
  translateFileName,
  translateSQLTableName,
  translateTypeName,
} from './translateNames'
import { DBMLField, DBMLSchema, DBMLTable } from './types'
import { createConfigForType, getEnums, getEnumValueDefinitions, translateImportType, translateImportTypes, getDefault, parseEnums } from './translateTypes'
import { uniqueArray } from './tools.array'
import { getReferences } from './references'
import { createIndexEntry } from './indexes'


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

  getFields(table: DBMLTable) {
    return table.fields.map(field => field.type.type_name)
  }

  createImportSection(table: DBMLTable) {
    const fields = this.getFields(table)
    const indexes = table.indexes
    const imports = this.getImports(table.name)

    let fileData = ''

    let usedTypes = translateImportTypes(fields)
    usedTypes = uniqueArray(usedTypes)
    if (indexes.length > 0) usedTypes.unshift('primaryKey')
    usedTypes.unshift('mysqlTable')

    fileData += `import { ${usedTypes.join(', ')} } from 'drizzle-orm/mysql-core'\n`
    if (usedTypes.includes('mysqlEnum')) {
      fileData += 'import z from \'zod\'\n'
    }
    imports.forEach(table => {
      fileData += `import { ${translateDrizzleObjectName(table)} } from './${translateFileName(table)}'\n`
    })
    fileData+= '\n'

    return fileData
  }

  createEnumSection(table: DBMLTable) {
    const fields = this.getFields(table)
    const enums = getEnums(fields)

    let fileData = ''

    enums.forEach(enumType => {
      const enumNameTranslated = translateEnumName(enumType)
      fileData += `const ${enumNameTranslated} = [\n`
      getEnumValueDefinitions(enumType).forEach(enumValueDef => {
        fileData += `  '${enumValueDef.name}',${enumValueDef.note ? ` // Note: ${enumValueDef.note}`: ''}\n`
      })
      fileData += '] as const\n'
      fileData += '\n'
      fileData += `export const ${enumType} = z.enum(${enumNameTranslated})\n`
      fileData += '\n'
      fileData += `export type ${enumType} = z.infer<typeof ${enumType}>\n`
      fileData += '\n'
    })

    return fileData
  }

  createFieldsSection(table:DBMLTable) {
    const drizzleName = translateDrizzleObjectName(table.name)
    const tableName = translateSQLTableName(table.name)

    let fileData = ''

    fileData += `export const ${drizzleName} = mysqlTable('${tableName}', {\n`
    table.fields.forEach(field => {
      fileData += `  ${this.createFieldEntry(table.name, field)},${field.note ? ` // Note: ${field.note}` : ''}\n`
    })

    return fileData
  }

  createIndexesSection(table: DBMLTable) {
    let fileData = ''

    const indexes = table.indexes

    if (indexes.length <= 0) {
      fileData += '})\n'
    } else {
      fileData += '}, (table) => {\n'
      fileData += '  return {\n'
      indexes.forEach(index => {
        fileData += `    ${createIndexEntry(index)},${index.note ? ` // Note: ${index.note}` : ''}\n`
      })
      fileData += '  }\n'
      fileData += '})\n'
    }
    fileData+= '\n'

    return fileData
  }

  createExportTypeSection(table: DBMLTable) {
    const drizzleName = translateDrizzleObjectName(table.name)
    const typeName = translateTypeName(table.name)

    return `export type ${typeName} = typeof ${drizzleName}.$inferSelect\n`
  }

  public create(table: DBMLTable) {

    let fileData = ''

    fileData += this.createImportSection(table)
    fileData += this.createEnumSection(table)
    fileData += this.createFieldsSection(table)
    fileData += this.createIndexesSection(table)
    fileData += this.createExportTypeSection(table)

    return fileData
  }
}
