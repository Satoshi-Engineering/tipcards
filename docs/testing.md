## Regression test steps

* Create a set
* Change settings:
  * Amount of cards
  * Card headline
  * Card copytext
  * Change logo
  * Set name
* Check print preview
* Download PNGs (is the QR codes logo correctly rendered)
* Set funding
  * Message
  * Note
* Single funding via invoice
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

  