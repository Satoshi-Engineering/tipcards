import { DBMLIndex } from './types'

export function createIndexEntry(index: DBMLIndex) {
  const columns = index.columns.map(column => column.value)

  let fileData = ''
  const pk = index.pk as unknown as boolean // Due type definition mistake in dbml package, should have been boolean not string
  if (pk) fileData += `pk: primaryKey(table.${columns.join(', table.')})`
  if (index.type === undefined && index.unique === undefined && index.pk === undefined) {
    fileData += `${index.name}: primaryKey(table.${columns.join(', table.')})`
  }

  if (fileData === '') throw new Error('Index Entry not implemented')

  return fileData
}
