import { createI18n } from 'vue-i18n'

const messages = {
  en: {
    general: {
      back: 'Back',
      cards: '{count} card | {count} cards',
    },
    footer: {
      support: 'Any questions, feedback or problems? Write us to {email}.',
    },
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
      },
      sectionUse: {
        headline: 'Use your bitcoin',
        message: 'You can now spend your bitcoin at a store or on a website that accepts bitcoin, transfer them to your friend\'s or colleague\'s Lightning wallet, or just hodl them.',
        examplesIntro: 'Here are a few websites where you can pay with bitcoin via Lightning:',
        examples: {
          saltNDaisy: 'Buy some organic sustainable Granola',
          coinpages: 'Find stores that accept bitcoin',
          roulette: 'Play a round of roulette',
          other: 'Find out what else you could do',
        },
        createYourOwnTipCardsHeadline: 'Create your own Tip Cards',
        createYourOwnTipCardsText: 'Would you like to give your friends or colleagues a few Sats (1 Sat = 0.00000001 Bitcoin) or tip someone in Bitcoin? Click on the following button and configure your personal Tip Cards.',
        createYourOwnTipCardsButton: 'Create my own Tip Cards',
      },
    },
    funding: {
      headline: 'Fund this Tip Card',
      text: 'This tip card has not been funded with sats yet. Specify the amount and the message you want the recipient to see in their wallet.',
      form: {
        textHint: 'will be displayed in the recipient\'s wallet',
        button: 'Jetzt aufladen',
      },
      invoiceText: 'Fund your Tip Card with {amount} sats:',
    },
    index: {
      buttonCreate: 'Create your Tip Cards set',
      savedCardsSetsHeadline: 'Saved Tip Cards sets',
      noSavedCardsSetsMessage: 'No saved Tip Cards sets found in this browser',
    },
    codes: {
      buttonCreate: 'Create codes',
      labelEnterWithdrawId: 'Enter your LNURLw withdraw ID',
      hintLnbits: '(Needs to be from {lnbitsLink})',
    },
    cards: {
      settings: {
        numberOfCards: 'Number of cards',
        cardHeadline: 'Card headline',
        cardText: 'Card text',
        cardQrCodeLogoLabel: 'Logo on QR codes',
        cardQrCodeLogo: {
          noLogo: 'No logo',
        },
      },
      buttonSaveCardsSet: 'Save Tip Cards set',
      buttonDeleteCardsSet: 'Delete saved set',
      buttonPrint: 'Print Tip Cards',
      buttonDownloadPngs: 'Download PNGs',
      saveSetConfirm: 'The current Tip Cards set will be saved locally in this browser, using localStorage.\n\nYou can also use the URL (from the address bar) to access this Tip Cards set.\n\nContinue?',
      deleteSetConfirm: 'Do you really want to delete the current Tip Cards set and its settings from this browser?',
      filterLabel: 'Display cards:',
      filter: {
        all: 'All',
        unfunded: 'Unfunded',
        funded: 'Funded',
        used: 'Used',
      },
    },
    lightningQrCode: {
      buttonOpenInWallet: 'Open in wallet',
      copyToClipboard: {
        lnurl: {
          beforeCopy: 'You can also {action} to paste it into your wallet app.',
          beforeCopyAction: 'copy the LNURL to your clipboard',
          afterCopySuccess: 'Copied successfully.',
          afterCopyNextStep: 'Paste it into<br>your wallet app now :)',
        },
        invoice: {
          beforeCopy: 'You can also {action} to paste it into your wallet app.',
          beforeCopyAction: 'copy the invoice to your clipboard',
          afterCopySuccess: 'Copied successfully.',
          afterCopyNextStep: 'Paste it into<br>your wallet app now :)',
        },
      },
    },
  },
  de: {
    general: {
      back: 'Zurück',
      cards: '{count} Karte | {count} Karten',
    },
    footer: {
      support: 'Hast du Fragen, Feedback oder ein Problem? Schreib uns an {email}.',
    },
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
        headline: 'Installiere eine Wallet',
        explanation: 'Um Bitcoin empfangen, speichern und ausgeben zu können, benötigst du eine <strong>Lightning wallet</strong>.<br>Für den alltäglichen Gebrauch und kleine Beträge ist eine Smartphone-App am bequemsten.',
        recommendation: 'Zum Einstieg empfehlen wir die {walletOfSatoshi}.',
        button: 'Wallet of Satoshi herunterladen',
        other: 'Du kannst auch {wallet0}, {wallet1}, {wallet2} ausprobieren oder irgendeine andere Wallet*.',
        otherFootnote: '* die mit LNURL kompatibel ist',
      },
      sectionReceive: {
        headline: 'Hol dir deine Bitcoin',
        statusNormal: {
          explanation: 'Sobald deine Wallet installiert ist,',
          step1: '<strong>drücke</strong> auf den QR-Code unten, oder',
          step2: '<strong>scanne</strong> den QR-Code auf deiner Tip Card erneut<br>(mit deiner Wallet app)',
        },
        statusReceived: {
          congrats: 'Gratulation!',
          message: 'Die Bitcoin wurden soeben in deine Wallet übertragen.',
        },
      },
      sectionUse: {
        headline: 'Verwende deine Bitcoin',
        message: 'Du kannst mit deinen Bitcoin jetzt etwas in einem Geschäft oder auf einer Website, wo Bitcoin akteptiert werden, kaufen. Oder du überweist sie in die Lightning Wallet eines Freundes oder einer Kollegin. Oder du hodlst sie einfach.',
        examplesIntro: 'Hier sind ein paar Links auf Sites, wo du Bitcoin verwenden kannst:',
        examples: {
          saltNDaisy: 'Kauf dir nachhaltiges Bio-Granola',
          coinpages: 'Such nach Geschäften, die Bitcoin akzeptieren',
          roulette: 'Spiel eine Runde Roulette',
          other: 'Finde heraus, was du sonst noch machen kannst',
        },
        createYourOwnTipCardsHeadline: 'Erstelle eigene Tip Cards',
        createYourOwnTipCardsText: 'Möchtest du deinen Freundinnen oder Bekannten ein paar Sats (1 Sat = 0,00000001 Bitcoin) schenken oder jemandem Trinkgeld in Form von Bitcoin geben? Klick auf den folgenden Button und konfiguriere deine persönlichen Tip Cards.',
        createYourOwnTipCardsButton: 'Meine eigenen Tip Cards erstellen',
      },
    },
    funding: {
      headline: 'Lade die Tip Card auf',
      text: 'Diese Tip Card wurde noch nicht mit Sats aufgeladen. Lege fest, welchen Betrag du aufladen möchtest und welche Nachricht der Empfänger in seiner Wallet sehen soll.',
      form: {
        textHint: 'wird in der Wallet des Empfängers angezeigt werden',
        button: 'Jetzt aufladen',
      },
      invoiceText: 'Lade {amount} Sats auf deine Tip Card:',
    },
    index: {
      buttonCreate: 'Erstelle dein Tip Cards-Set',
      savedCardsSetsHeadline: 'Gespeicherte Tip Cards-Sets',
      noSavedCardsSetsMessage: 'In diesem Browser sind derzeit keine Tip Cards-Sets gespeichert',
    },
    codes: {
      buttonCreate: 'QR-Codes erstellen',
      labelEnterWithdrawId: 'Gib deine LNURLw withdraw ID ein',
      hintLnbits: '(Muss von {lnbitsLink} sein)',
    },
    cards: {
      settings: {
        numberOfCards: 'Anzahl',
        cardHeadline: 'Karten-Überschrift',
        cardText: 'Karten-Text',
        cardQrCodeLogoLabel: 'Logo auf den QR-Codes',
        cardQrCodeLogo: {
          noLogo: 'Kein Logo',
        },
      },
      buttonSaveCardsSet: 'Tip Cards-Set speichern',
      buttonDeleteCardsSet: 'Set löschen',
      buttonPrint: 'Tip Cards drucken',
      buttonDownloadPngs: 'PNGs downloaden',
      saveSetConfirm: 'Das aktuelle Tip Cards-Set wird lokal in diesem Browser gespeichert (dafür wird localStorage verwendet).\n\nDu kannst auch die URL (siehe Browser-Adressleiste) verwenden um später erneut auf dieses Tip Cards-Set zuzugreifen.\n\nMöchtest du speichern?',
      deleteSetConfirm: 'Möchtest du die Einstellungen des aktuellen Tip Cards-Sets wirklich aus dem Browser löschen?',
      filterLabel: 'Karten filtern:',
      filter: {
        all: 'Alle',
        unfunded: 'Nicht aufgeladen',
        funded: 'Aufgeladen',
        used: 'Eingelöst',
      },
    },
    lightningQrCode: {
      buttonOpenInWallet: 'In der Wallet öffnen',
      copyToClipboard: {
        lnurl: {
          beforeCopy: 'Du kannst {action} um sie in deiner Wallet einzufügen.',
          beforeCopyAction: 'die LNURL auch kopieren',
          afterCopySuccess: 'Erfolgreich kopiert.',
          afterCopyNextStep: 'Füge sie jetzt<br>in deiner Wallet app ein :)',
        },
        invoice: {
          beforeCopy: 'Du kannst {action} um sie in deiner Wallet einzufügen.',
          beforeCopyAction: 'die Rechnung auch kopieren',
          afterCopySuccess: 'Erfolgreich kopiert.',
          afterCopyNextStep: 'Füge sie jetzt<br>in deiner Wallet app ein :)',
        },
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
