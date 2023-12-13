import { fromCamelCaseToUnderScore, upperCaseFirst } from './tools.strings'

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

export function translateEnumConstName(enumName: string) {
  return `${fromCamelCaseToUnderScore(enumName).toUpperCase()}S`
}
