# CrowdSale Smart Contract Spec

## Testing and Code Coverage
---

```
$ ganache-cli --gasLimit 8000000 --gasPrice 100000000000

// output
  Mnemonic:      remember violin confirm festival figure museum famous ride jaguar jealous barely bounce
  Base HD Path:  m/44'/60'/0'/0/{account_index}

  Listening on localhost:8545

```

### Open new terminal window


```
// run unit test
truffle test --network local
// run coverage test
truffle solium -d contracts/ && solidity-coverage

// output

Contract: Crowdsale

    + owner should be 0xee198da7a08a3ce63163b1e1dd059f1447d1bcce
    + ecosystem part should be 40%
    + community part should be 40%
    + company part should be 20%
    + rate should be not 0
    + investors part should be % of total supply (83ms)
    + contract balance should be 0 at start
    + owner of crowdsale smart contract should not have Tokens on start
    + crowdsale smart contract should have tokens on balance (60ms)
       Was a revert found at setFreezingPeriod? true
       Was a revert found at addBuyer? true
       Was a revert found at delBuyer? true
       Was a revert found at startICO? true
       Was a revert found at stopICO? true
       Was a revert found at refundEther? true
       Was a revert found at sendTokens? true
       Was a revert found at increaseIcoDuration? true
       Was a revert found at setcompanyWallet? true
    + should revert all onlyManager functions, when called not from manager (472ms)
    + should add manager (113ms)
    + should add whitelisted private sale participant (116ms)
    + should show whitelisted participants as array
    + should add freezing period to token (90ms)
    + should start ICO round (88ms)
    + should increase ICO duration (110ms)
       Was a revert found at sending 11% of investors token amount? true
    + should send tokens to investor (364ms)
    + tokens should be freezed for investor (57ms)
       Was a revert found at transfer? true
    + transfer should be reverted during the freezing period (115ms)
    + should set company wallet address (81ms)
    + should receive ethers (93ms)
    + should show how much tokens to send for investor (49ms)
    + should keep stats for investor
    + should refund ethers by one click (439ms)
    + should record refunding to stats
    + should keep stats on sold tokens
    + should STOP ico (298ms)
    + should delete private sale participant (81ms)
    + should delete manager (111ms)

    contracts/Crowdsale.sol
  138:17    warning    Avoid using 'block.timestamp'.                                                                                                         security/no-block-members
  190:32    warning    "(token.totalSupply())": A call without arguments should have brackets without any whitespace between them, like 'functionName ()'.    function-whitespace
  207:32    warning    "(token.totalSupply())": A call without arguments should have brackets without any whitespace between them, like 'functionName ()'.    function-whitespace
  327:12    warning    Avoid using 'block.timestamp'.                                                                                                         security/no-block-members
  344:17    warning    Avoid using 'block.timestamp'.                                                                                                         security/no-block-members
  355:26    warning    Avoid using 'block.timestamp'.                                                                                                         security/no-block-members
  358:8     warning    Avoid using 'block.timestamp'.                                                                                                         security/no-block-members
  538:32    warning    "(token.totalSupply())": A call without arguments should have brackets without any whitespace between them, like 'functionName ()'.    function-whitespace

    contracts/Token.sol
  233:6     warning    Avoid using 'block.timestamp'.    security/no-block-members
  253:19    warning    Avoid using 'block.timestamp'.    security/no-block-members

    ✖ 10 warnings found.

    ----------------------|----------|----------|----------|----------|----------------|
    File                  |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
    ----------------------|----------|----------|----------|----------|----------------|
    contracts/           |    94.62 |    55.26 |    96.77 |    95.65 |                |
    Crowdsale.sol       |    93.46 |    51.43 |     93.1 |    94.92 |... 507,544,545 |
    Managed.sol         |    91.67 |       60 |      100 |    94.44 |             93 |
    Ownable.sol         |      100 |       75 |      100 |      100 |                |
    ReentrancyGuard.sol |      100 |       50 |      100 |      100 |                |
    SafeMath.sol        |    90.91 |       50 |      100 |    90.91 |             14 |
    Token.sol           |    97.83 |       65 |      100 |    97.92 |            198 |
    ----------------------|----------|----------|----------|----------|----------------|
    All files             |    94.62 |    55.26 |    96.77 |    95.65 |                |
    ----------------------|----------|----------|----------|----------|----------------|

```


## Class Diagrams
---

![Distribution Inheritance](https://raw.githubusercontent.com/listaction/bigcontrols-sc/master/galery/Contracts%20Inheritance/img/Distribution%20Inheritance%20Diagram.png)

![Token Inheritance](https://raw.githubusercontent.com/listaction/bigcontrols-sc/master/galery/Contracts%20Inheritance/img/Token%20Inheritance%20Diagram.png)

## Private Sale Functions
---

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
Returns the number of tokens in Crowdsale smart contact balance

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

## Usage of the contract
---

This describes how the smart contract will be used, in what order functions are expected to be invoked when
it is executed in practice.

1) addManager - input is address of the smart contract manager who is responsible for the private sale process

2) addBuyer - input is the address of investors are participating in the private sale

3) setFreezingPeriod - optional call - input is the freeze period for tokens with time in seconds

4) setCompanyWallet - input is the address of the Ethereum wallet of the company to which funds will be transferred after the private sale.

5) startICO - starts the private sale (ICO)

6) Fallback function for sending ethers to smart contract

7) sendTokens - for manual transfer of token on BTC value

8) stopICO - to stop the private sale (ICO) and transfer funds to the company wallet from step 4

9) refundEther - to refund in some emergency state
