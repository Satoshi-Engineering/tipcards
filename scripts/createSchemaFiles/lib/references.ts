import { translateDrizzleObjectName } from './translateNames'

export function getReferences(info, tableName: string, fieldName: string) {

  let oneToManyEndpoint = null
  let oneToOneEndpoint = null

  info.schemas[0].refs.forEach(ref => {
    const endpoints = ref.endpoints

    if (endpoints[1].tableName === tableName && endpoints[1].fieldNames[0] === fieldName
      && endpoints[0].relation === '1' && endpoints[1].relation === '1') {

      oneToOneEndpoint = endpoints
    }

    if (endpoints[1].tableName === tableName && endpoints[1].fieldNames[0] === fieldName && endpoints[1].relation === '*') {
      oneToManyEndpoint = endpoints
    }
  })

  if (oneToManyEndpoint !== null) return `.references(() => ${translateDrizzleObjectName(oneToManyEndpoint[0].tableName)}.${oneToManyEndpoint[0].fieldNames[0]})`
  if (oneToOneEndpoint !== null) return `.references(() => ${translateDrizzleObjectName(oneToOneEndpoint[0].tableName)}.${oneToOneEndpoint[0].fieldNames[0]}).unique()`

  return ''
}
