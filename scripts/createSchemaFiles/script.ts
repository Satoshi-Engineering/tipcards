/* eslint-disable no-console */

import { SchemaCreator } from './lib/SchemaCreator'

console.info('Schema Creator')

import { Parser } from '@dbml/core'
import * as fs from 'fs'
import { DBMLTable } from './lib/types'
import { translateFileName } from './lib/translateNames'
import { deleteSchemaFiles, writeIndexFile } from './lib/dir'

const DEFINITIONS_FILE = './docs/database.dbml'
const OUTPUT_DIR = './backend/src/database/drizzle/schema'

const dbml = fs.readFileSync(DEFINITIONS_FILE, 'utf-8')

const database = Parser.parse(dbml, 'dbml')
const info = database.export()
const workingSchema = info.schemas[0]

const schemaCreate = new SchemaCreator(workingSchema)

function writeSchemaFile(table: DBMLTable) {
  const fileName = `${translateFileName(table.name)}.ts`
  const fileData = schemaCreate.create(table)
  fs.writeFileSync(`${OUTPUT_DIR}/${fileName}`, fileData)
}

function writeSchemaFiles() {
  workingSchema.tables.forEach(table => {
    console.log(`Creating: ${table.name}`)
    writeSchemaFile(table)
  })
}

deleteSchemaFiles(OUTPUT_DIR)
writeSchemaFiles()
writeIndexFile(OUTPUT_DIR)
