# Private Sale Spec

## Class Diagrams

![Distribution Inheritance](https://raw.githubusercontent.com/listaction/bigcontrols-sc/master/galery/Contracts%20Inheritance/img/Distribution%20Inheritance%20Diagram.png)

![Token Inheritance](https://raw.githubusercontent.com/listaction/bigcontrols-sc/master/galery/Contracts%20Inheritance/img/Token%20Inheritance%20Diagram.png)

## ICO stage Functions

### setFreezingPeriod
```JavaScript
function setFreezingPeriod(uint _time)
    onlyManager nonReentrant public returns(bool) 
```
Set freezing period for private sale investors

### purchase
```JavaScript
function purchase(address _from)
    public nonZeroAddress(_from) validPurchaseAmount payable
```
Fallback function to receive Ethers

### addBuyer
```JavaScript
function addBuyer(address _buyer)
    onlyManager nonZeroAddress(_buyer) nonReentrant public returns(bool)
```
Add buyer to whitelist

### delBuyer
```JavaScript
function delBuyer(address _buyer)
    onlyManager nonZeroAddress(_buyer) nonReentrant public returns(bool)
```
Remove buyer from whitelist

### showBuyers 
```JavaScript
function showBuyers()
    public constant returns(address[])
```
View buyers whitelist

### startICO
```JavaScript
function startICO()
    public onlyManager nonReentrant returns(bool)
```
Starting ICO

### stopICO
```JavaScript
function stopICO()
   checkDistributionState onlyManager nonReentrant public returns(bool)
```
Turning off the ICO

### checkICOState 
```JavaScript
function checkICOState() internal 
```
Check & update ICO state

### sendReserves
```JavaScript
function sendReserves() internal onlyManager
```
Send & freeze tokens for the participants wallets

### refundEther
```JavaScript
function refundEther()
    onlyManager nonReentrant public returns(bool)
```
Send ether for buyers wallets

### getEthAndStore
```JavaScript
function getEthAndStore(uint _ethAmount, address _to)
   whitelisted distributionIsOn nonZeroAddress(_to) nonReentrant internal
```
Calculating tokens amount, if ETH value comes to contract

### getAmountOfTokensToSend
```JavaScript
function getAmountOfTokensToSend(address _investor)
    public view onlyManager returns(uint)
```
This will return how much tokens should be sent to 

### sendTokens
```JavaScript
function sendTokens(address _to, uint _amount)
   checkDistributionState
   onlyManager
   investornonZeroAddress(_to)
   validAmountForManualSend(_amount)
   nonReentrant
   public
```
Sending tokens to the recipient, based on calculation on BTC amount

### distributeToken
```JavaScript
function distributeToken(address _to, uint _amount) 
    internal nonZeroAddress(_to) returns(bool)
```
Distibutes tokens, based on current distribution state

### contractBalance 
```JavaScript
function contractBalance()
    public view returns(uint)
```
Show contract balance

### myBalance 
```JavaScript
function myBalance()
    public view returns(uint)
```
Returns the number of tokens in the buyer's wallet

### tokensSupply 
```JavaScript
function tokensSupply()
    public view returns(uint)
```
Returns number of supplied tokens

### contractTokenBalance 
```JavaScript
function contractTokenBalance()
    public view returns(uint)
```
Returns the number of tokens at Crowdsale smart contact

### getValidPurchase 
```JavaScript
function getValidPurchase()
    public view returns(uint) 
```
Returns number which is maximum amount of tokens per 1 investor

### increaseIcoDuration
```JavaScript
function increaseIcoDuration(uint _time)
   public onlyManager nonReentrant returns(bool)
```
Update an ICO timestamp finish date

### setcompanyWallet
```JavaScript
function setcompanyWallet(address newCompanyWallet) 
   public nonZeroAddress(newCompanyWallet) onlyManager nonReentrant returns(bool)
```
Sets new company wallet address to which the accumulated ether will be sent
