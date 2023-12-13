/* eslint-disable @typescript-eslint/no-explicit-any */

export type DBMLField = {
  name: string
  type: {
    type_name: string
    args: any
    schemaName: any
  }
  unique: boolean
  pk: boolean
  not_null: boolean
  note: string
  dbdefault: any
  increment: boolean
}

export type DBMLIndex = {
  columns: {
    type: any
    value: any
  }[]
  name: string
  type: any
  unique: boolean
  pk: string
  note: string
}


export type DBMLTable = {
  fields: DBMLField[]
  indexes: DBMLIndex[]
  name: string
  alias: string
  note: string
  headerColor: string
}

export type DBMLEnum = {
  values: DBMLEnumValue[]
  name: string
  note: string
}

export type DBMLEnumValue = {
  name: string
  note: string
}

export type DBMLEndpoint = {
  schemaName: string
  tableName: string
  fieldNames: string[]
  relation: any
}

export type DBMLSchema = {
  tables: DBMLTable[]
  enums: DBMLEnum[]
  tableGroups: {
    tables: {
      tableName: string
      schemaName: string
    }[]
    name: string
  }[]
  refs: {
    endpoints: DBMLEndpoint[]
    name: string
    onDelete: any
    onUpdate: any
  }[]
  name: string
  note: string
  alias: string
}
