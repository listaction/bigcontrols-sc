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

## Run localy with UI
```
ganache-cli --gasLimit 8000000 --gasPrice 100000000000

// output
  Mnemonic:      remember violin confirm festival figure museum famous ride jaguar jealous barely bounce
  Base HD Path:  m/44'/60'/0'/0/{account_index}

  Listening on localhost:8545
```
Open new terminal window
```
truffle migrate --network local && remix-ide contracts

// output
Running migration: 1_initial_migration.js
Saving artifacts...
Running migration: 2_deploy_crowdsale.js

Shared folder : contracts/
Starting Remix IDE at http://localhost:8080 and sharing contracts/
Thu May 24 2018 16:07:46 GMT+0700 (+07) Remixd is listening on 127.0.0.1:65520
```

Run your browser and go to http://localhost:8080

Click a button mentioned at the picture below

![](https://raw.githubusercontent.com/listaction/bigcontrols-sc/master/galery/ReadmeImg/linkLocalhost.png)

Click `connect` on the appeared window

![](https://raw.githubusercontent.com/listaction/bigcontrols-sc/master/galery/ReadmeImg/connectionReq.png)

Add crowdsale contract to work space

![](https://raw.githubusercontent.com/listaction/bigcontrols-sc/master/galery/ReadmeImg/addCrowdsale.png)

Click compile button and wait until response apears like mentioned at the picture below

![](https://raw.githubusercontent.com/listaction/bigcontrols-sc/master/galery/ReadmeImg/compile.png)

Click on metamask window and choose localhost:8545

![](https://raw.githubusercontent.com/listaction/bigcontrols-sc/master/galery/ReadmeImg/connectMetamask.png)

Click on choosing account button 

![](https://raw.githubusercontent.com/listaction/bigcontrols-sc/master/galery/ReadmeImg/connectAccount.png)

Open terminal window where you have running `ganache-cli` and copy private key, example below
```
Copy private key of account you want to access, e.g. (0) account
Available Accounts
==================
(0) 0x0d517d435a0532459680fbd53ea0cabecff5441f
(1) 0x69acac2d2980db6bd80ae538a44e9816d71a1b5b

Private Keys
==================
(0) d1412a6cdea6a29b6f305d3e99e5f77df45106f77ca99ba3ecff8a459e1dac1d

```

Scroll down and choose import account

Paste copied private key to appropriate field

Choose the ethereum network provider, take the `Injected Web3`

![](https://raw.githubusercontent.com/listaction/bigcontrols-sc/master/galery/ReadmeImg/provider.png)

To run WITHOUT Metamask

By default ganache-cli starts at port 8545, so NO changes required

![](https://raw.githubusercontent.com/listaction/bigcontrols-sc/master/galery/ReadmeImg/providerDialog2.png)

Make sure that you successfully connected to your local test Ethereum network.

![](https://raw.githubusercontent.com/listaction/bigcontrols-sc/master/galery/ReadmeImg/web3set.png)

Recall the output of `truffle migrate` and copy the last address
```
Running migration: 2_deploy_crowdsale.js
  Deploying Utils...
  ... 0xcdbf257515d9ed2c31921af25691e52433474498cad405b8476cc5d5263f7b95
  Utils: 0x6e332b6b3eea54fdaf43b682898114b5f52c42cf
  Deploying Ownable...
  ... 0xed6e6ba84de2eb0e3e32820136cba433fcf7d632ed9024fa119fd900e87b7f65
  Ownable: 0x57a5224773c0b99345f950ddfe360796334567b5
  Deploying Managed...
  ... 0xecde51800baaf5a84bfb9d72c96e76c7dd21fdc8b8cc732a68478115bb69ea5a
  Managed: 0x513d891d0d9aabd6b72a42a6eff105015db582e5
  Deploying Crowdsale...
  ... 0xbabdb4300817fcf9ea8f40943bf2bbbb3961fe90f2ab05b0fe50b114dd2c984d
  Crowdsale: 0x5d20defc8f1468a635fb5bfad3702e9e8a5ee86e
Saving artifacts...

```
Currently it is `Crowdsale: 0x5d20defc8f1468a635fb5bfad3702e9e8a5ee86e`

Paste copied address to specific field and click "At Address", the instance of smart contract should appears below

![](https://raw.githubusercontent.com/listaction/bigcontrols-sc/master/galery/ReadmeImg/atAddress.png)

Now you are ready for testing

### Transaction
##### By default the gas estimation goes wrong, so have to do it manualy.
For succesffull transaction execution you must set TX gas limit to at 300000


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
