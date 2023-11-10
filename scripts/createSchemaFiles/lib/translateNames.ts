import {fromCamelCaseToUnderScore, lowerCaseFirst, upperCaseFirst} from './tools.strings'

export function translateSQLTableName(table: string) {
  return `${fromCamelCaseToUnderScore(table)}s`
}

export function translateDrizzleObjectName(table: string) {
  return `${lowerCaseFirst(table)}`
}

export function translateTypeName(table: string){
  return `${upperCaseFirst(table)}`
}

export function translateFileName(table: string) {
  return `${upperCaseFirst(table)}`
}
