import { z } from 'zod'

export const PrintSettings = z.object({
  name: z.string().nullable().default(null),
  link: z.string().url().nullable().default(null),
  pageWidth: z.number().positive().default(210),
  pageHeight: z.number().positive().default(296), // A4 minus one pixel, to prevent some browsers from adding extra pages
  minPrintMarginHorizontal: z.number().nonnegative().default(10),
  minPrintMarginVertical: z.number().nonnegative().default(10),
  cardWidth: z.number().positive().default(85),
  cardHeight: z.number().positive().default(55),
  cardGapHorizontal: z.number().nonnegative().default(0),
  cardGapVertical: z.number().nonnegative().default(0),
  fontSizeHeadline: z.number().positive().default(3.7),
  fontSizeText: z.number().positive().default(3.3),
  qrCodeSize: z.number().positive().default(41),
  qrCodeX: z.number().nonnegative().default(3),
  qrCodeY: z.number().nonnegative().default(7),
  frontSideImage: z.string().nullable().default(null),
  backSideImage: z.string().nullable().default(null),
  doubleSidedPrinting: z.boolean().default(false),
  backSidesOnly: z.boolean().default(false),
  printBorders: z.boolean().default(false),
  printText: z.boolean().default(true),
  printCropMarks: z.boolean().default(true),
  printSetInfo: z.boolean().default(true),
})

export type PrintSettings = z.infer<typeof PrintSettings>;

const defaultPrintSettings: PrintSettings = PrintSettings.parse({
  name: 'Default settings',
})

const avery45x45: PrintSettings = {
  ...defaultPrintSettings,
  name: 'Avery Labels 45x45',
  link: 'https://amzn.eu/d/8kg1nry',
  cardWidth: 45,
  cardHeight: 45,
  cardGapHorizontal: 5,
  cardGapVertical: 5,
  qrCodeSize: 39,
  qrCodeX: 3,
  qrCodeY: 3,
  minPrintMarginHorizontal: 7,
  minPrintMarginVertical: 25,
  printCropMarks: false,
  printText: false,
}

const avery80x50: PrintSettings = {
  ...defaultPrintSettings,
  name: 'Avery Labels 80x50',
  link: 'https://amzn.eu/d/4jF6Kxd',
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

const avery60x30: PrintSettings = {
  ...defaultPrintSettings,
  name: 'Avery Labels 60x30',
  link: 'https://www.avery-zweckform.com/blanko-etiketten/rechteckig-60x30-mm',
  cardWidth: 60,
  cardHeight: 30,
  cardGapHorizontal: 5,
  cardGapVertical: 5,
  qrCodeSize: 24,
  qrCodeX: 3,
  qrCodeY: 3,
  fontSizeHeadline: 3,
  fontSizeText: 2.7,
  minPrintMarginHorizontal: 10,
  minPrintMarginVertical: 10,
  printCropMarks: false,
  printText: true,
}

export default [
  defaultPrintSettings,
  avery45x45,
  avery80x50,
  avery60x30,
]
