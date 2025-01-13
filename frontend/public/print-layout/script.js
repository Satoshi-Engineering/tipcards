const TEMPLATE_QRCODE_LINK = 'https://adsasdasd.io/funding/f428575507b59fa559fbc999999e1a673234716b76213255e05da47b8e153d0742'

// All values in mm
const cardWidth = 85
const cardHeight = 55
const pageWidth = 210
const pageHeight = 297
const cropMarkLength = 5
const cropMarkPadding = 3
const qrCodeX = 4.7
const qrCodeY = 5.4
// Value in Px
const qrCodeSize = 168

const cardsPerRow = Math.floor(pageHeight / cardHeight)
const cardsPerColumn = Math.floor(pageWidth / cardWidth)
const cardsPerPage = cardsPerRow * cardsPerColumn

const pages = []

const pagesContainer = document.getElementById('pagesContainer')
const numberOfCardsElement = document.getElementById('numberOfCards')

const updatePage = () => {
  clearPages()

  const numberOfCards = numberOfCardsElement.value
  // GET QR CODES
  const qrCodes = Array.from({ length: numberOfCards }, (_, i) => `${TEMPLATE_QRCODE_LINK}${i}`)
  const numberOfPages = Math.ceil(numberOfCards / cardsPerPage)

  for (let i = 0; i < numberOfPages; i++) {
    const startIndex = i * cardsPerPage
    const endIndex = Math.min(startIndex + cardsPerPage, numberOfCards)
    const pageQrCodes = qrCodes.slice(startIndex, endIndex)

    const numberOfCardsOnPage = Math.min(cardsPerPage, numberOfCards - i * cardsPerPage)
    const frontPage = createFrontpage(numberOfCardsOnPage)
    createCropMarks(frontPage)
    const backPage = createBackpage(pageQrCodes)
    createCropMarks(backPage)
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
  return page
}

const createBackpage = (qrCodes) => {
  const numberOfCards = qrCodes.length
  const page = createPage()
  for (let i = 0; i < numberOfCards; i++) {
    // On the backside, if the number of cards is odd, we need to add an empty card to push it to the right side
    if (numberOfCards %2 === 1 && i === numberOfCards - 1) {
      createCard(page)
    }
    const card = createCard(page)
    createBackpageContent(card, qrCodes[i])
  }
  return page
}

const createPage = () => {
  const div = document.createElement('section')
  div.className = 'sheet centerGrid gridLayout'
  pagesContainer.appendChild(div)
  pages.push(div)
  return div
}

const createCropMarks = (page) => {
  let offsetY = (pageHeight - cardsPerRow * cardHeight) / 2
  let offsetX = (pageWidth - cardsPerColumn * cardWidth) / 2

  for (let i = 0, y = offsetY; i <= cardsPerRow; i++, y += cardHeight) {
    // Crop Mark Left
    createCropMark(page, offsetX - cropMarkLength - cropMarkPadding, y, 'horizontal')
    // Crop Mark Right
    createCropMark(page, pageWidth - offsetX + cropMarkPadding, y, 'horizontal')
  }

  for (let i = 0, x = offsetX; i <= cardsPerColumn; i++, x += cardWidth) {
    // Crop Mark Top
    createCropMark(page, x, offsetY - cropMarkLength - cropMarkPadding, 'vertical')
    // Crop Mark Bottom
    createCropMark(page, x, pageHeight - offsetY + cropMarkPadding, 'vertical')
  }
}

const createCropMark = (page, x, y, orientation) => {
  const markLeft = document.createElement('div')
  markLeft.className = 'absolute'
  markLeft.style.left = `${x}mm`
  markLeft.style.top = `${y}mm`
  if (orientation === 'horizontal') {
    markLeft.className += ' border-t'
    markLeft.style.width = `${cropMarkLength}mm`
    markLeft.style.height = '0mm'
  }
  if (orientation === 'vertical') {
    markLeft.className += ' border-l'
    markLeft.style.width = '0mm'
    markLeft.style.height = `${cropMarkLength}mm`
  }
  page.appendChild(markLeft)
}

const createFrontpageContent = (card) => {
  card.className += ' centerContent'
  const img = document.createElement('img')
  img.src = 'img/bitcoin.svg'
  img.alt = 'Bitcoin Logo'

  img.style.width = '40mm'
  card.appendChild(img)
}

const createBackpageContent = (card, qrCodeLink) => {
  const img = document.createElement('img')
  img.className = 'absolute top-0 left-0'
  img.src = 'img/back.png'
  img.style.height = '55mm'
  //img.style.width = '85mm'
  card.appendChild(img)

  card.className += ' relative'
  const qrCodeElement = document.createElement('div')
  qrCodeElement.className = 'absolute top-0 left-0'
  // eslint-disable-next-line no-undef
  new QRCode(qrCodeElement, {
    text: qrCodeLink,
    width: qrCodeSize,
    height: qrCodeSize,
    //colorLight: '#990000',
  })
  qrCodeElement.style.left = `${qrCodeX}mm`
  qrCodeElement.style.top = `${qrCodeY}mm`
  card.appendChild(qrCodeElement)
}

const createCard = (page) => {
  const div = document.createElement('div')
  div.className = 'card'
  page.appendChild(div)
  return div
}

numberOfCardsElement.addEventListener('input', updatePage)

window.addEventListener('load', updatePage)
