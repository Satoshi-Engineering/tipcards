import { createI18n } from 'vue-i18n'

const messages = {
  en: {
    landing: {
      introGreeting: 'Hey!',
      introMessageReceiveBtc: {
        message: 'You are just about to receive {amountAndUnit}',
        amountAndUnit: '{amount} bitcoin*',
        footnote: '* via Lightning',
      },
      introMessageAlreadyUsed: {
        headline: 'It seems that this QR code has already been used.',
        message: 'But don\'t worry: You can get your own bitcoin at a Bitcoin ATM or a Crypto exchange etc.',
      },
      introMessageJustReceived: {
        headline: 'Your QR code has just been used. {emoji}',
        message: 'You can get more bitcoin at a Bitcoin ATM or a Crypto exchange etc.',
      },
      sectionBitcoin: {
        paragraphs: {
          0: 'Bitcoin is a <strong>digital currency</strong>.',
          1: 'It is being managed by all members of the bitcoin network, which means it is <strong>not under control</strong> of any central bank, government, or company.',
          2: 'Transactions (including international ones) are as easy as scanning a QR code. Just give it a try!',
        },
      },
      sectionWallet: {
        headline: 'Download a wallet',
        explanation: 'To receive, store and spend your bitcoin, you need a <strong>Lightning wallet</strong>.<br>For every-day use and small amounts, a smartphone app is most convenient.',
        recommendation: 'For starters we recommend {walletOfSatoshi}.',
        button: 'Download Wallet of Satoshi',
        other: 'You can also try {wallet0}, {wallet1}, {wallet2} or any other Lightning wallet*.',
        otherFootnote: '*that understands LNURL',
      },
      sectionReceive: {
        headline: 'Receive your bitcoin',
        statusNormal: {
          explanation: 'As soon as your wallet is installed,',
          step1: '<strong>tap</strong> the QR code below, or',
          step2: '<strong>scan</strong> the QR code on your tip card again<br>(using your wallet app)',
        },
        statusReceived: {
          congrats: 'Congrats!',
          message: 'The bitcoin were just transferred to your wallet.',
        },
        buttonOpenInWallet: 'Open in wallet',
        copyToClipboard: {
          beforeCopy: 'You can also {action} to paste it into your wallet app.',
          beforeCopyAction: 'copy the LNURL to your clipboard',
          afterCopySuccess: 'Copied successfully.',
          afterCopyNextStep: 'Paste it into<br>your wallet app now :)',
        },
      },
      sectionUse: {
        headline: 'Use your bitcoin',
        message: 'You can now spend your bitcoin at a store or on a website that accepts bitcoin, transfer them to your friend\'s or colleague\'s Lightning wallet, or just hodl them.',
        examplesIntro: 'Here are a few websites where you can pay with bitcoin via Lightning:',
        examples: {
          saltNDaisy: 'Buy some organic sustainable Granola',
          roulette: 'Play a round of roulette',
          other: 'Find out what else you could do',
        },
      },
    },
  },
  de: {
    landing: {
      introGreeting: 'Hi!',
      introMessageReceiveBtc: {
        message: 'Hier kannst du dir {amountAndUnit} holen*.',
        amountAndUnit: '{amount} Bitcoin',
        footnote: '* über Lightning',
      },
      introMessageAlreadyUsed: {
        headline: 'Dieser QR-Code wurde anscheinend bereits eingelöst.',
        message: 'Aber keine Sorge: Du kannst dir Bitcoin auch an einem Bitcoin-Automaten oder einer Crypto-Börse etc. kaufen.',
      },
      introMessageJustReceived: {
        headline: 'Dein QR-Code wurde soeben eingelöst. {emoji}',
        message: 'Mehr Bitcoin kannst du dir an einem Bitcoin-Automaten oder einer Crypto-Börse etc. kaufen.',
      },
      sectionBitcoin: {
        paragraphs: {
          0: 'Bitcoin ist eine <strong>digitale Währung</strong>.',
          1: 'Es wird von allen Teilnehmer:innen des Bitcoin-Netzwerks verwaltet, das bedeutet es ist <strong>nicht unter Kontrolle</strong> einer Zentralbank, Regierung oder eines Konzerns.',
          2: 'Überweisungen (auch internationale) sind so einfach wie das Scannen eines QR-Codes. Probier es einfach aus!',
        },
      },
      sectionWallet: {
        headline: 'Installiere dir eine Wallet',
        explanation: 'Um Bitcoin empfangen, speichern und ausgeben zu können, benötigst du eine <strong>Lightning wallet</strong>.<br>Für den alltäglichen Gebrauch und kleine Beträge ist eine Smartphone-App am bequemsten.',
        recommendation: 'Zum Einstieg empfehlen wir die {walletOfSatoshi}.',
        button: 'Wallet of Satoshi herunterladen',
        other: 'Du kannst auch {wallet0}, {wallet1}, {wallet2} ausprobieren oder irgendeine andere Wallet*.',
        otherFootnote: '* die mit LNURL kompatibel ist',
      },
    },
  },
}

const getPreferredLocale = () => {
  for (const lang of navigator.languages) {
    if (Object.keys(messages).includes(lang)) {
      return lang
    }
    const langShort = lang.split('-')[0]
    if (Object.keys(messages).includes(langShort)) {
      return langShort
    }
  }
}

const i18n = createI18n({
  legacy: false,
  locale: getPreferredLocale(),
  fallbackLocale: 'en',
  messages,
})

export default i18n
