import { Invoice } from '@backend/database/schema/index.js'

export default class InvoiceWithSetFundingInfo {
  public readonly invoice: Invoice
  public readonly cardsFundedWithThisInvoice: number

  constructor(invoice: Invoice, cardsFundedWithThisInvoice: number) {
    this.invoice = invoice
    this.cardsFundedWithThisInvoice = cardsFundedWithThisInvoice
  }

  public get isSetFunding(): boolean {
    return this.cardsFundedWithThisInvoice > 1
  }

  public get amountPerCard(): number {
    return Math.floor(this.invoice.amount / this.cardsFundedWithThisInvoice)
  }

  public get isPaid(): boolean {
    return this.invoice.paid != null
  }

  public get isExpired(): boolean {
    return this.invoice.expiresAt < new Date()
  }
}
