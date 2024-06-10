import { pgTable, primaryKey, varchar } from 'drizzle-orm/pg-core'
import { CardVersion } from './CardVersion'
import { Invoice } from './Invoice'

export const CardVersionHasInvoice = pgTable('CardVersionHasInvoice', {
  cardVersion: varchar('cardVersion', { length: 36 }).notNull().references(() => CardVersion.id),
  invoice: varchar('invoice', { length: 64 }).notNull().references(() => Invoice.paymentHash),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.cardVersion, table.invoice] }),
  }
})

export type CardVersionHasInvoice = typeof CardVersionHasInvoice.$inferSelect
