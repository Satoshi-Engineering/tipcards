import { CardVersion } from '@backend/database/schema/index.js'

import InvoiceWithSetFundingInfo from './InvoiceWithSetFundingInfo.js'

export default class CardVersionWithInvoices {
  public readonly cardVersion: CardVersion
  public readonly invoices: InvoiceWithSetFundingInfo[]

  constructor(cardVersion: CardVersion, invoices: InvoiceWithSetFundingInfo[]) {
    this.cardVersion = cardVersion
    this.invoices = invoices
  }

  public get isSetFunding(): boolean {
    return this.invoices.some(invoice => invoice.isSetFunding)
  }

  public get amountPaid(): number {
    return this.invoices
      .filter(invoice => invoice.isPaid)
      .reduce((acc, invoice) => acc + invoice.amountPerCard, 0)
  }

  public get feeAmountPaid(): number {
    return this.invoices
      .filter(invoice => invoice.isPaid)
      .reduce((acc, invoice) => acc + invoice.feeAmountPerCard, 0)
  }

  public get amountTotal(): number {
    return this.invoices.reduce((acc, invoice) => acc + invoice.amountPerCard, 0)
  }

  public get allInvoicesPaid(): boolean {
    return this.invoices.every(invoice => invoice.isPaid)
  }

  public get anyExpired(): boolean {
    return this.invoices.some(invoice => invoice.isExpired)
  }
}
