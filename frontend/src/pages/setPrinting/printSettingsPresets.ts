import { z } from 'zod'

export const PrintSettings = z.object({
  name: z.string(),
  link: z.string().url().optional(),
  doubleSidedPrinting: z.boolean(),
  pageWidth: z.number().positive(),
  pageHeight: z.number().positive(),
  minPrintMarginHorizontal: z.number().nonnegative(),
  minPrintMarginVertical: z.number().nonnegative(),
  cardWidth: z.number().positive(),
  cardHeight: z.number().positive(),
  cardGapHorizontal: z.number().nonnegative(),
  cardGapVertical: z.number().nonnegative(),
  qrCodeSize: z.number().positive(),
  qrCodeX: z.number().nonnegative(),
  qrCodeY: z.number().nonnegative(),
  frontSideImage: z.string().optional(),
  backSideImage: z.string().optional(),
  printBorders: z.boolean(),
  printText: z.boolean(),
  printCropMarks: z.boolean(),
})

export type PrintSettings = z.infer<typeof PrintSettings>;

const defaultPrintSettings: PrintSettings = {
  name: 'Default settings',
  doubleSidedPrinting: false,
  pageWidth: 210,
  pageHeight: 296,
  minPrintMarginHorizontal: 10,
  minPrintMarginVertical: 10,
  cardWidth: 85,
  cardHeight: 55,
  cardGapHorizontal: 0,
  cardGapVertical: 0,
  qrCodeSize: 41,
  qrCodeX: 3,
  qrCodeY: 7,
  frontSideImage: undefined,
  backSideImage: undefined,
  printBorders: false,
  printText: true,
  printCropMarks: true,
}

const avery45x45: PrintSettings = {
  ...defaultPrintSettings,
  name: 'Avery Zweckform 45x45',
  link: 'https://www.amazon.de/AVERY-Zweckform-Klebeetiketten-r%C3%BCckstandsfrei-selbstklebende/dp/B08QRJ2C1X',
  cardWidth: 45,
  cardHeight: 45,
  cardGapHorizontal: 5,
  cardGapVertical: 5,
  qrCodeSize: 41,
  qrCodeX: 2,
  qrCodeY: 2,
  minPrintMarginHorizontal: 7,
  minPrintMarginVertical: 25,
  printCropMarks: false,
  printText: false,
}

const avery80x50: PrintSettings = {
  ...defaultPrintSettings,
  name: 'Avery Zweckform 80x50',
  link: 'https://www.amazon.de/AVERY-Zweckform-J4785-20-Namensetiketten-Inkjet-Drucker/dp/B00I4UG5FC',
  cardWidth: 80,
  cardHeight: 50,
  cardGapHorizontal: 15,
  cardGapVertical: 5,
  qrCodeSize: 40,
  qrCodeX: 5,
  qrCodeY: 5,
  minPrintMarginHorizontal: 17,
  minPrintMarginVertical: 13,
  printCropMarks: false,
  printText: true,
}

export default [
  defaultPrintSettings,
  avery45x45,
  avery80x50,
]
