### migrate redis->drizzle

#### logged out
* create a card invoice with custom text+note (do not fund)
* fund a card via invoice
* scan a card to create a lnurlp (do not fund)
* fund a card via lnurlp
* fund a card via shared funding (do not finish)
* fund a card via shared funding and finish the funding
* create a set funding (do not fund)
* fund a set via set funding
* fund a card (doesnt matter how) + withdraw it

#### auth
##### user A
* log in with user A
* set account name, display name and email
* log out

##### user B
* log in with user B
* set account name, display name and email
* add coinfinity logo to available images
* add coinfinity landing page to available landing pages
* stay logged in and check after migration if you're still logged in

#### logged in with user B
* save set A: with custom card amount, headline and card text. use bitcoin logo
* save set B: with lightning logo
* save set C: with no logo
* save set D: with coinfinity logo + landing page
* fund a card from set A via invoice
* fund a card from set A via lnurlp
* create a bulkwithdraw for set A, but do not withdraw
* set fund set C
* bulk withdraw set C
