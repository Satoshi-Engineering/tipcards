/* eslint-disable no-console */

console.info('Schema Creator')

import { DEFINITIONS_FILE, OUTPUT_DIR, ENUM_DIR_NAME } from './consts'
import { Parser } from '@dbml/core'
import * as fs from 'fs'
import { DBMLEnum, DBMLTable } from './lib/types'
import { translateFileName } from './lib/translateNames'
import { checkAndCreateDirectory, deleteFilesInDirectory, deleteFolderRecursive, writeIndexFile } from './lib/dir'
import { SchemaCreator } from './lib/SchemaCreator'

const dbml = fs.readFileSync(DEFINITIONS_FILE, 'utf-8')

const database = Parser.parse(dbml, 'dbml')
const info = database.export()
const workingSchema = info.schemas[0]

const schemaCreate = new SchemaCreator(workingSchema)

function writeSchemaFile(table: DBMLTable) {
  const fileName = `${translateFileName(table.name)}.ts`
  const fileData = schemaCreate.createTableFileData(table)
  fs.writeFileSync(`${OUTPUT_DIR}/${fileName}`, fileData)
}

function writeEnumFile(enumData: DBMLEnum) {
  const fileName = `${translateFileName(enumData.name)}.ts`
  const fileData = schemaCreate.createEnumFileData(enumData)

  fs.writeFileSync(`${OUTPUT_DIR}/${ENUM_DIR_NAME}/${fileName}`, fileData)
}

function writeEnumFiles() {
  workingSchema.enums.forEach(enumData => {
    console.log(`Creating Enum: ${enumData.name}`)
    writeEnumFile(enumData)
  })
}

function writeSchemaFiles(tableName = '') {
  workingSchema.tables.forEach(table => {
    if (tableName !== '' && table.name !== tableName) { return }
    console.log(`Creating Table: ${table.name}`)
    writeSchemaFile(table)
  })
}

const args = process.argv.slice(2)

if (args.length >= 1) {
  writeSchemaFiles(args[0])
  process.exit(0)
}

deleteFolderRecursive(`${OUTPUT_DIR}/${ENUM_DIR_NAME}`)
deleteFilesInDirectory(OUTPUT_DIR)
checkAndCreateDirectory(OUTPUT_DIR)
checkAndCreateDirectory(`${OUTPUT_DIR}/${ENUM_DIR_NAME}`)
writeEnumFiles()
writeSchemaFiles()
writeIndexFile(OUTPUT_DIR)
