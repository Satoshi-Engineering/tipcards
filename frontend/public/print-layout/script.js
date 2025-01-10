const TEMPLATE_QRCODE_LINK = 'https://adsasdasd.io/funding/f428575507b59fa559fbc999999e1a673234716b76213255e05da47b8e153d0742'

const cardWith = 85
const cardHeight = 55
const pageWith = 210
const pageHeight = 297

const pages = []

const pagesContainer = document.getElementById('pagesContainer')
const numberOfCardsElement = document.getElementById('numberOfCards')

const updatePage = () => {
  clearPages()

  const numberOfCards = numberOfCardsElement.value
  const cardsPerRow = Math.floor(pageWith / cardWith)
  const cardsPerColumn = Math.floor(pageHeight / cardHeight)
  const cardsPerPage = cardsPerRow * cardsPerColumn
  const numberOfPages = Math.ceil(numberOfCards / cardsPerPage)

  for (let i = 0; i < numberOfPages; i++) {
    const numberOfCardsOnPage = Math.min(cardsPerPage, numberOfCards - i * cardsPerPage)
    createFrontpage(numberOfCardsOnPage)
    createBackpage(numberOfCardsOnPage)
  }
}

const clearPages = () => {
  pages.forEach(page => page.remove())
  pages.splice(0, pages.length)
}

const createFrontpage = (numberOfCards) => {
  const page = createPage(numberOfCards)
  for (let i = 0; i < numberOfCards; i++) {
    const card = createCard(page)
    createFrontpageContent(card)
  }
}

const createBackpage = (numberOfCards) => {
  const page = createPage()
  for (let i = 0; i < numberOfCards; i++) {
    const card = createCard(page)
    createBackpageContent(card)
  }
}

const createPage = () => {
  const div = document.createElement('section')
  div.className = 'sheet centerGrid gridLayout'
  pagesContainer.appendChild(div)
  pages.push(div)
  return div
}

const createFrontpageContent = (card) => {
  card.className += ' centerContent'
  const img = document.createElement('img')
  img.src = 'img/bitcoin.svg'
  img.alt = 'Bitcoin Logo'
  img.style.width = '35mm'
  card.appendChild(img)
}

const createBackpageContent = (card) => {
  const offsetSecondColumn = 50

  card.className += ' stackContainer'
  const qrCodeElement = document.createElement('div')
  qrCodeElement.className = 'stackItem'
  // eslint-disable-next-line no-undef
  new QRCode(qrCodeElement, {
    text: TEMPLATE_QRCODE_LINK,
    width: 165,
    height: 165,
  })
  qrCodeElement.style.left = '3mm'
  qrCodeElement.style.top = '3mm'
  card.appendChild(qrCodeElement)

  const valid = document.createElement('div')
  valid.className = 'stackItem validText'
  valid.innerText = 'Satoshis gülitg bis: 15.02.2025'
  valid.style.left = '3mm'
  valid.style.top = '47mm'
  card.appendChild(valid)

  const headline = document.createElement('div')
  headline.className = 'stackItem headlineText'
  headline.innerText = 'Hallo!'
  headline.style.left = `${offsetSecondColumn}mm`
  headline.style.top = '3mm'
  card.appendChild(headline)

  const text1 = document.createElement('div')
  text1.className = 'stackItem defaultText'
  text1.innerText = 'Wir freuen uns dich auf einem unserer Bitcoin-Meetups begrüßen zu dürfen!'
  text1.style.left = `${offsetSecondColumn}mm`
  text1.style.top = '10mm'
  card.appendChild(text1)

  const text2 = document.createElement('div')
  text2.className = 'stackItem defaultText'
  text2.innerText = 'Hier erhältst du deine ersten Satoshis.'
  text2.style.left = `${offsetSecondColumn}mm`
  text2.style.top = '17mm'
  card.appendChild(text2)
}

const createCard = (page) => {
  const div = document.createElement('div')
  div.className = 'card'
  page.appendChild(div)
  return div
}

numberOfCardsElement.addEventListener('input', updatePage)

window.addEventListener('load', updatePage)
