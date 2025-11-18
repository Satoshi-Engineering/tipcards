import { FEE_PERCENTAGE } from '@shared/constants.js'

export const calculateFeeForNetAmount = (netAmountInSats: number): number => Math.ceil(netAmountInSats * FEE_PERCENTAGE)
export const calculateFeeForGrossAmount = (grossAmountInSats: number): number => Math.ceil(grossAmountInSats - grossAmountInSats / (1 + FEE_PERCENTAGE))
