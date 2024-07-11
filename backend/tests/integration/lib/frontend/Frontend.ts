import axios from 'axios'

import hashSha256 from '@backend/services/hashSha256.js'

import { API_ORIGIN } from '../constants.js'

export default class Frontend {
  async createCardViaAPI(cardHash: string, amount: number, text = '', note = '') {
    return await axios.post(`${API_ORIGIN}/api/invoice/create/${cardHash}`, {
      amount,
      text,
      note,
    })
  }

  async createCardInvoice(cardHash: string, amount: number, text = '', note = '') {
    return await this.createCardViaAPI(cardHash, amount, text, note)
  }

  async createSharedFunding(cardHash: string, text = '', note = '') {
    return await axios.post(`${API_ORIGIN}/api/lnurlp/create/${cardHash}`, {
      text,
      note,
    })
  }

  async updateSharedFunding(cardHash: string, text = '', note = '') {
    return await axios.post(`${API_ORIGIN}/api/lnurlp/update/${cardHash}`, {
      text,
      note,
    })
  }

  async finishSharedFunding(cardHash: string, text = '', note = '') {
    return await axios.post(`${API_ORIGIN}/api/lnurlp/finish/${cardHash}`, {
      text,
      note,
    })
  }

  async loadCard(cardHash: string) {
    return await axios.get(`${API_ORIGIN}/api/card/${cardHash}?origin=cards`)
  }

  async loadLnurlForCardHash(cardHash: string) {
    return await axios.get(`${API_ORIGIN}/api/lnurl/${cardHash}`)
  }

  async deleteCard(cardHash: string) {
    return await axios.delete(`${API_ORIGIN}/api/invoice/delete/${cardHash}`)
  }

  getCardHashBySetIdAndCardIndex(setId: string, cardIndex: number) {
    return hashSha256(`${setId}/${cardIndex}`)
  }

  async createSetFundingInvoice(setId: string, amountPerCard: number, cardIndices: number[], text = '', note = '') {
    return await axios.post(`${API_ORIGIN}/api/set/invoice/${setId}`, {
      amountPerCard,
      cardIndices,
      text,
      note,
    })
  }

  async loadSet(setId: string) {
    return await axios.get(`${API_ORIGIN}/api/set/${setId}`)
  }

  async deleteSetFundingInvoice(setId: string) {
    return await axios.delete(`${API_ORIGIN}/api/set/invoice/${setId}`)
  }
}
