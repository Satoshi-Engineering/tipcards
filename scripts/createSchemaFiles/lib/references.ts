import { translateDrizzleObjectName } from './translateNames'
import { DBMLEndpoint, DBMLSchema } from './types'

export function getReferences(schema: DBMLSchema, tableName: string, fieldName: string) {

  let oneToManyEndpoint: DBMLEndpoint[] = []
  let oneToOneEndpoint: DBMLEndpoint[] = []

  schema.refs.forEach(ref => {
    const endpoints = ref.endpoints

    if (endpoints[1].tableName === tableName && endpoints[1].fieldNames[0] === fieldName
      && endpoints[0].relation === '1' && endpoints[1].relation === '1') {

      oneToOneEndpoint = endpoints
    }

    if (endpoints[1].tableName === tableName && endpoints[1].fieldNames[0] === fieldName && endpoints[1].relation === '*') {
      oneToManyEndpoint = endpoints
    }
  })

  if (oneToManyEndpoint.length !== 0) { return `.references(() => ${translateDrizzleObjectName(oneToManyEndpoint[0].tableName)}.${oneToManyEndpoint[0].fieldNames[0]})` }
  if (oneToOneEndpoint.length !== 0) { return `.references(() => ${translateDrizzleObjectName(oneToOneEndpoint[0].tableName)}.${oneToOneEndpoint[0].fieldNames[0]}).unique()` }

  return ''
}
