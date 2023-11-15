/* eslint-disable no-console */

import {SchemaCreator} from './lib/SchemaCreator'

console.info('Schema Creator')

import { Parser } from '@dbml/core'
import * as fs from 'fs'
import {DBMLTable} from './lib/types'
import {translateFileName} from './lib/translateNames'
import {deleteSchemaFiles, writeIndexFile} from './lib/dir'

const DEFINITIONS_FILE = './docs/database.dbml'
const OUTPUT_DIR = './backend/src/database/drizzle/schema'

const dbml = fs.readFileSync(DEFINITIONS_FILE, 'utf-8')

const database = Parser.parse(dbml, 'dbml')
const info = database.export()
const workingSchema = info.schemas[0]

const schemaCreate = new SchemaCreator(workingSchema)

function createSchemaFile(table: DBMLTable) {
  const fileName = `${translateFileName(table.name)}.ts`
  const fileData = schemaCreate.create(table)
  fs.writeFileSync(`${OUTPUT_DIR}/${fileName}`, fileData)
}

deleteSchemaFiles(OUTPUT_DIR)

workingSchema.tables.forEach(table => {
  console.log(`Creating: ${table.name}`)

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
  //if (table.name === 'UserCanUseImage') createSchemaFile(table)
  //if (table.name === 'UserCanUseLandingPage') createSchemaFile(table)
  //if (table.name === 'AllowedRefreshTokens') createSchemaFile(table)

  // createSchemaFile(table)
})

writeIndexFile(OUTPUT_DIR)
