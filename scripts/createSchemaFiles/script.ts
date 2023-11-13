/* eslint-disable no-console */

// Purpose: Create Drizzle MySql Schemal file from a dbml file
// Howto
// npm install -D @dbml/core
// Call from project root
// npx ts-node scripts/createSchemaFiles/script.ts
// TODO: remove type string
// TODO: add type varchar && text

import {getReferences} from './lib/references'

console.info('Create Definitions')

import { Parser } from '@dbml/core'
import * as fs from 'fs'
import { uniqueArray } from './lib/tools.array'
import {
  createConfigForType,
  getEnums, getEnumValueDefinitions,
  parseEnums,
  translateImportType,
  translateImportTypes,
} from './lib/types'
import { translateDrizzleObjectName, translateFileName, translateSQLTableName, translateTypeName } from './lib/translateNames'

const DEFINITIONS_FILE = './docs/database.dbml'
const OUTPUT_DIR = './backend/src/database/drizzle/schema'

const dbml = fs.readFileSync(DEFINITIONS_FILE, 'utf-8')

const database = Parser.parse(dbml, 'dbml')
const info = database.export()

const getImports = (tableName: string) => {
  const imports: string[] = []

  info.schemas[0].refs.forEach(ref => {
    const endpoints = ref.endpoints
    if (endpoints[1].tableName === tableName && (endpoints[1].relation === '1' || endpoints[1].relation === '*')) {
      imports.push(endpoints[0].tableName)
    }
  })

  return imports
}


const getDefault = (dbdefault) => {
  if (dbdefault.type === 'boolean' && dbdefault.value === 'null') return ''
  if (dbdefault.type === 'boolean') return `.default(${dbdefault.value})`

  throw new Error(`Default value for type:${dbdefault.type} Not Implemented!`)
}

const createFieldEntry = (tableName: string, field) => {
  if (field.name === 'lnurlP') console.log(field)

  const config = createConfigForType(field.type.type_name)

  let line = `${field.name}: `
  line+=`${translateImportType(field.type.type_name)}('${field.name}'${config})`
  if (field.pk === true) line += '.primaryKey()'
  if (field.unique === true) line += '.unique()'
  if (field.not_null === undefined || field.not_null === true) line += '.notNull()'
  if (field.dbdefault !== undefined) line += getDefault(field.dbdefault)
  line += getReferences(info, tableName, field.name)

  return line
}

const createSchemaFile = (table) => {
  console.log(`Creating: ${table.name}`)

  const fileName = `${translateFileName(table.name)}.ts`
  const tableName = translateSQLTableName(table.name)
  const drizzleName = translateDrizzleObjectName(table.name)
  const typeName = translateTypeName(table.name)

  const fields = table.fields.map(field => field.type.type_name)
  const imports = getImports(table.name)
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
    fileData += `  ${createFieldEntry(table.name, field)},${field.note ? ` // Note: ${field.note}` : ''}\n`
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

  console.log(fileData)
  fs.writeFileSync(`${OUTPUT_DIR}/${fileName}`, fileData)
}

// console.log(Object.keys(info.schemas[0]))
// [ 'name', 'note', 'alias', 'tables', 'enums', 'tableGroups', 'refs' ]

parseEnums(info.schemas[0].enums)

info.schemas[0].tables.forEach(table => {
  if (table.name === 'Card') createSchemaFile(table)
  if (table.name === 'CardVersion') createSchemaFile(table)
  if (table.name === 'Invoice') createSchemaFile(table)
  if (table.name === 'LnurlP') createSchemaFile(table)
  if (table.name === 'LnurlW') createSchemaFile(table)
  if (table.name === 'Set') createSchemaFile(table)
  if (table.name === 'Image') createSchemaFile(table)
  if (table.name === 'LandingPage') createSchemaFile(table)
  if (table.name === 'SetSettings') createSchemaFile(table)
  if (table.name === 'User') createSchemaFile(table)
  if (table.name === 'CardVersionHasInvoice') createSchemaFile(table)
  if (table.name === 'Profile') createSchemaFile(table)

  //if (table.name === 'UserCanUseSet') createSchemaFile(table)

})
