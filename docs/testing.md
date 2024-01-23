# Regression test steps

## general
Test everything at least with: Wallet of Satoshi, Breez, Phoenix.

***Reminder:*** Don't forget to remember all funded cards and withdraw your funds at the end.

## card
* make sure you are logged out
* create a new set

### invoice
* click on any card and then click 'fund card'
* reload the page
* click 'reset tip card'
* go back to the set page

* click on any card
* change text and note
* toggle currency multiple times and change the amount in between (EUR, sats, BTC should be possible)
* click 'fund card'
* reload the page
* click 'reset tip card'
* go back to the set page

* click on any card and then click 'fund card'
* scan the invoice qr code with your wallet app and pay it
* the qr code should display the success animation
* the 'reset tip card' button has to be disabled
* click on the card status below, the landing page with the funded amount should be visible
* go back to the set page

* click on any card and then click 'fund card'
* click on 'open in wallet' and pay the invoice (you can do that on your phone if you have no wallet on your pc)
* the qr code should display the success animation
* the 'reset tip card' button has to be disabled
* click on the card status below, the landing page with the funded amount should be visible
* go back to the set page

* click on any card and then click 'fund card'
* click on 'copy the invoice to the clipboard', then open your wallet app with the invoice in the clipboard
* the wallet app should prompt you if you want to pay the invoice, pay it
* the qr code should display the success animation
* the 'reset tip card' button has to be disabled
* click on the card status below, the landing page with the funded amount should be visible
* go back to the set page

### lnurlp
* scan a card with your wallet app and fund it
* click on the card, the landing page with the funded amount should be visible
* go back to the set page

* scan a card with your wallet app, but don't fund it
* click on the card in the browser
* click 'reset tip card'
* go back to the set page

* scan a card with your wallet app, but don't fund it
* click on the card in the browser
* change text and note
* reload the page
* the changed text and note should be visible (auto saved)
* now fund the card by scanning the qr code on the funding page
* the qr code should display the success animation
* the 'reset tip card' button has to be disabled
* click on the card status below, the landing page with the funded amount should be visible
* go back to the set page

* open a card from the set page in a second tab
* it should show the invoice creation form, but don't create an invoice
* scan the card from the set page with your wallet app
* go to the second tab, it should switch from invoice create form to showing the lnurlp qrcode
* close the second tab and go back to the set page

### shared funding
* scan a card with your wallet app, but don't fund it
* click on the card in the browser
* click on 'shared funding' at the bottom
* reload the page
* click 'reset tip card'
* go back to the set page

* scan a card with your wallet app, but don't fund it
* click on the card in the browser
* click on 'shared funding' at the bottom
* fund the card once
* the 'reset tip card' button has to be disabled now
* fund the card again
* click 'finish funding'
* the qr code should display the success animation
* click on the card status below, the landing page with the funded amount should be visible
* go back to the set page

* click on another card
* it should show the invoice create form
* click on 'shared funding' at the bottom
* reload the page
* fund the card once
* scan the card with your phone (not the wallet), you should see the funding qr code and a form with text+note in the mobile browser
* change text+note on your pc
* it should be updated on the phone after a few moments
* fund the card another time
* change text+note on your phone
* it should be updated on your pc after a few moments
* click 'finish funding'
* the qr code should display the success animation
* the 'reset tip card' button has to be disabled
* click on the card status below, the landing page with the funded amount should be visible
* go back to the set page

## auth

## deprecated localstorage sets

###### old stuff
* Create a set
* Change settings:
  * Amount of cards
  * Card headline
  * Card copytext
  * Change logo
  * Set name
* Save the set
* Reload page and go to saved set
* Edit and save set
* Check print preview
* Download PNGs (is the QR codes logo correctly rendered)
* Set funding
  * Reset card
  * Message
  * Note
* Single funding via invoice
  * Reset card
  * Message
  * Note
* Single funding via LNURLp
* Shared funding (try at least 2 transactions)
  * Message
  * Note
* Open preview of landingpage for a funded card
  * -> Check status on cards page (should not be viewed)
* Scan a card's QR code w/ camera app and open landing page
  * -> Check status on cards page (should be viewed)
* Check LNURLw from landing page
  * Click on QR code or button
  * Scan QR code
  * Copy LNURL and paste into wallet app
* Withdraw
  * Wait for landingpage status to change
  * -> Check status on cards page
* Withdraw directly by scanning card QR code with wallet
  * -> Check status on cards page
