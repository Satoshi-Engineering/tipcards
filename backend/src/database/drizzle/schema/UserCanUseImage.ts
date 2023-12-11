import { mysqlTable, primaryKey, varchar, boolean } from 'drizzle-orm/mysql-core'
import { User } from './User'
import { Image } from './Image'

export const UserCanUseImage = mysqlTable('UserCanUseImage', {
  user: varchar('user', { length: 64 }).notNull().references(() => User.id),
  image: varchar('image', { length: 36 }).notNull().references(() => Image.id),
  canEdit: boolean('canEdit').notNull().default(false),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.user, table.image] }),
  }
})

export type UserCanUseImage = typeof UserCanUseImage.$inferSelect
