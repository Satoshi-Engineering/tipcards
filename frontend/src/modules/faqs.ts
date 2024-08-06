export const FAQS: Record<string, { questionKeypath: string, answerKeypath: string }> = {
  support: {
    questionKeypath: 'faqs.questions.support.question',
    answerKeypath: 'faqs.questions.support.answer',
  },
  monitorCards: {
    questionKeypath: 'faqs.questions.monitorCards.question',
    answerKeypath: 'faqs.questions.monitorCards.answer',
  },
  getBackSats: {
    questionKeypath: 'faqs.questions.getBackSats.question',
    answerKeypath: 'faqs.questions.getBackSats.answer',
  },
  bulkFunding: {
    questionKeypath: 'faqs.questions.bulkFunding.question',
    answerKeypath: 'faqs.questions.bulkFunding.answer',
  },
}

export type Faq = typeof FAQS[keyof typeof FAQS]
