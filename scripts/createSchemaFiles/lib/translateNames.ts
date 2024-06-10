import { lowerCaseFirst, upperCaseFirst } from './tools.strings'

export function translateSQLTableName(table: string) {
  return `${upperCaseFirst(table)}`
}

export function translateDrizzleObjectName(table: string) {
  return `${upperCaseFirst(table)}`
}

export function translateTypeName(table: string){
  return `${upperCaseFirst(table)}`
}

export function translateFileName(table: string) {
  return `${upperCaseFirst(table)}`
}

export function translateEnumName(enumName: string) {
  return `${upperCaseFirst(enumName)}`
}

export function translateEnumFunctionName(enumName: string) {
  return `${lowerCaseFirst(enumName)}`
}
