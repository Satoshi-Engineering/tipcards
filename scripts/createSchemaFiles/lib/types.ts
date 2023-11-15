export type DBMLField = {
  name: string
  type: any
  unique: boolean
  pk: boolean
  not_null: boolean
  note: string
  dbdefault: any
  increment: boolean
}

export type DBMLTable = {
  fields: DBMLField[]
  indexes: {
    columns: {
      type: any
      value: any
    }[]
    name: string
    type: any
    unique: boolean
    pk: string
    note: string
  }[]
  name: string
  alias: string
  note: string
  headerColor: string
}

export type DBMLSchema = {
  tables: DBMLTable[]
  enums: {
    values: {
      name: string
      note: string
    }[]
    name: string
    note: string
  }[]
  tableGroups: {
    tables: {
      tableName: string
      schemaName: string
    }[]
    name: string
  }[]
  refs: {
    endpoints: {
      schemaName: string
      tableName: string
      fieldNames: string[]
      relation: any
    }[]
    name: string
    onDelete: any
    onUpdate: any
  }[]
  name: string
  note: string
  alias: string
}

