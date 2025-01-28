import { FEE_PERCENTAGE } from '@shared/constants.js'

export const caluclateFeeForCard = (amountInSats: number): number => Math.ceil(amountInSats * FEE_PERCENTAGE)
