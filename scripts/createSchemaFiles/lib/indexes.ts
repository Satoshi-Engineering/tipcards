import { DBMLIndex } from './types'

export function createIndexEntry(index: DBMLIndex) {
  const columns = index.columns.map(column => column.value)

  let fileData = ''
  const pk = index.pk as unknown as boolean // Due a type definition mismatch the in dbml package, should have been boolean not string
  if (pk) { fileData += `pk: primaryKey({ columns: [table.${columns.join(', table.')}] })` }
  if (index.type === undefined && index.unique === undefined && index.pk === undefined) {
    fileData += `${index.name}: index('${index.name}').on(table.${columns.join(', table.')})`
  }

  if (fileData === '') { throw new Error('Index Entry not implemented') }

  return fileData
}

export function getUsedTypesFromIndexes(indexs: DBMLIndex[]) {
  const usedTypes: string[] = []

  indexs.forEach(index => {
    const pk = index.pk as unknown as boolean // Due a type definition mismatch the in dbml package, should have been boolean not string
    if (pk) { usedTypes.push('primaryKey') }
    if (index.type === undefined && index.unique === undefined && index.pk === undefined) {
      usedTypes.push('index')
    }
  })

  return usedTypes
}
