import { FEE_PERCENTAGE } from '@shared/constants.js'

export const calculateFeeForCard = (amountInSats: number): number => Math.ceil(amountInSats * FEE_PERCENTAGE)
