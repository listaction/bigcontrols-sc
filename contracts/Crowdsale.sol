pragma solidity 0.4.24;

import "./Ownable.sol";
import "./SafeMath.sol";
import "./Token.sol";
import "./Managed.sol";

contract Crowdsale is Managed {

  using SafeMath for uint256;

  /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  *  VARIABLES
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */ 
  enum State {
    PRIVATE,
    PUBLIC
  }
  
  /**
  * @dev Company wallet
  * The address to which the received ether will be sent
  */
  address public companyWallet;

  /**
  * @dev Buyers who passed KYC process
  */
  address[] public whiteList;

  /**
  * @dev Buyers statistic
  */
  mapping (address => Investor) public investor;

  struct Investor {
    bool state;         // flag that investor valid / exists
    uint256 weiSent;       // total WEIs got from this contributor
    uint256 totalAmount;   // total amount of Tokens that was sent
    bool etherRefunded; // eth was refunded
  }

  /**
  * @dev ICO start date
  */
  uint256 public start;

  /**
  * @dev ICO duration
  */
  uint256 public ICODuration;

  /**
  * @dev Number of tokens decimals
  */
  uint256 public decimals;

  /**
  * @dev Cost of the token,amount of tokens per 1 ETH
  */
  uint256 public rate;

  /**
  * @dev Number of sold tokens
  */
  uint256 public totalSold;

  /**
  * @dev Number of accumulated ether
  */
  uint256 public totalWeiAccumulated;

  /**
  * @dev Share of tokens reserved for the Company and Team
  */
  uint256 public companyPart;

  /**
  * @dev Share of tokens reserved for ICO sale
  */
  uint256 public investorsPart;

  /**
  * @dev Share of tokens reserved for future product needs
  */
  uint256 public ecosystemPart;

  /**
  * @dev ICO Status
  */
  bool public ICOState;

  /**
  * @dev Once call flag
  */
  bool internal startedOnce;

  /**
  * @dev Once send flag
  */
  bool internal reservesSent;

  /**
  * @dev Instance of new Token Smart contract
  */
  SingleToken public token = new SingleToken();
  
  /**
   * @dev Current distribution state
   * @notice It checks by modifier "checkDistributionState"
  */
  State public distributionState = State.PRIVATE;
  
  /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  *  EVENTS
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */ 
  event StartICO(uint256 time);

  event StopICO(uint256 time);

  event NewWalletAddress(address indexed _wallet);

  event NewCompanyWallet(address indexed _wallet);

  event EtherRefunded(address indexed _wallet, uint256 _value);

  event NewIcoPeriod(uint256 _time);
  
  /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  *  MODIFIERS
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
  /**
  * @dev 1) Validates that ICO is running
         2) Validates that ICO is started
         3) Validates that ICO is not yet ended
  */
  modifier distributionIsOn() {
    uint256 today = block.timestamp;
    uint256 _ICODuration = start.add(ICODuration);
    require (_ICODuration != 0);
    require (ICOState && today >= start && today < _ICODuration, "Sale is not ongoing");
    _;
  }

  /**
   * @dev 1) Validates if the investor authorized to do investments
  */
  modifier whitelisted() {
    Investor storage _investor = investor[msg.sender];
    bool _state = _investor.state;
    require(
      _state,
      "Investor is not authorized to purchase Tokens"
    );
    _;
  }
  
  /**
   * @dev Validates the input, define that it is not a 0x0 address
  */
  modifier nonZeroAddress(address _to) {
    require(
      _to != address(0),
      "Given address is incorrect!"
    );
    _;
  }

  /**
   * @dev Check that Crowdsale end 
   * @notice If the Crowdsale ended, distributionState sets to PUBLIC
  */
  modifier checkDistributionState() {
    checkICOState();
    if(!ICOState) {
      distributionState = State.PUBLIC;
    }
    else{
      distributionState = State.PRIVATE;
    }
    _;
  }

  /**
  * @dev validate that ethers comes for not more than
    AllEmission * investorsPart * 10% of tokens
  */
  modifier validPurchaseAmount () {
    require(msg.value > 0);
    uint256 investorsTokenPart = (((token.totalSupply()).mul(investorsPart)).div(100)).div(decimals);
    uint256 maxValue = (investorsTokenPart.mul(10)).div(100);
    uint256 currentIncommingValue = (msg.value).div(rate);
    require(currentIncommingValue != 0);
    require(currentIncommingValue <= maxValue);
    _;
  }

  /**
  * @dev validate that manual token transfer not sending more than
    AllEmission * investorsPart * 10% of tokens
  */
  modifier validAmountForManualSend(
    uint256 _amount
  )
  {
    require(_amount > 0);
    uint256 investorsTokenPart = (((token.totalSupply()).mul(investorsPart)).div(100)).div(decimals);
    uint256 maxValue = (investorsTokenPart.mul(10)).div(100);
    require(_amount <= maxValue);
    _;
  }

  /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  *  CONTRACT BODY
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */ 
  constructor() public {
    ecosystemPart = 40;
    investorsPart = 40;
    companyPart = 20;
    
    ICODuration = 10 minutes;
    rate = 1E14; // SET PRICE PER 1 TOKEN IN WEIs
    
    decimals = 10**uint256(token.decimals());
  }
  
  /**
   * @dev Set freezing period for private sale investors
   * @param _time Quantity of seconds from now will be the timestamp until freezed
  */
  function setFreezingPeriod(
    uint256 _time
  )
   onlyManager
   nonReentrant
   public
   returns(bool) 
  {
    token.freeze(_time);
    return true;
  }
  
  /**
   * @dev Fallback function to receive Ethers
  */
  function ()
   public
   payable
  {
    purchase(msg.sender);
  }

  /**
  * @dev Fallback function
  * @notice _from could be passed manualy or on fallback funtion
  * @param _from address to which should funds be recorded
  */
  function purchase(address _from)
   public
   nonZeroAddress(_from)
   validPurchaseAmount
   payable
  {
    getEthAndStore(msg.value, _from);
  }

  /**
  * @dev Add buyer to whitelist
    this method is calling by backend
  * @param _buyer address of Investor to add to whitelist
  */
  function addBuyer(
    address _buyer
  )
   onlyManager
   nonZeroAddress(_buyer)
   nonReentrant
   public
   returns(bool)
  {
    require(
      !investor[_buyer].state,
      "Buyer is already exists"
    );
    whiteList.push(_buyer);
    investor[_buyer].state = true;
    return true;
  }

  /**
  * @dev Remove buyer from whitelist
  * @param _buyer address of whitelist member
  */
  function delBuyer(address _buyer)
   onlyManager
   nonZeroAddress(_buyer)
   nonReentrant
   public
   returns(bool)
  {
    investor[_buyer].state = false;
    return true;
  }

  /**
  * @dev View buyers whitelist
  */
  function showBuyers() public view returns(address[]) {
    return whiteList;
  }

  /**
  * @dev Starting ICO
  */
  function startICO()
   public
   onlyManager
   nonReentrant
   returns(bool)
   {
    require(
      !startedOnce,
      "The ICO is already been started"
    );
    startedOnce = true;
    ICOState = true;
    start = block.timestamp;
    emit StartICO(start);
    return true;
  }

  /**
  * @dev Turning off the ICO
  */
  function stopICO()
   checkDistributionState
   onlyManager
   nonReentrant
   public
   returns(bool)
  {
    sendReserves();
    companyWallet.transfer(address(this).balance);
    emit StopICO(block.timestamp);
    return true;
  }

  /**
  * @dev Check & update ICO state
  */
  function checkICOState() internal {
    uint256 endOfICO = start.add(ICODuration);
    require(endOfICO > start);

    uint256 blockTimestamp = block.timestamp;
    require(endOfICO != 0 && endOfICO != blockTimestamp);

    if (block.timestamp >= start.add(ICODuration)) {
      ICOState = false; 
      require(ICOState != true);
    }
    else {
      ICOState = true;
      require(ICOState != false);
    }
  }

  /**
  * @dev Send & freeze tokens for the participants wallets
  */
  function sendReserves() internal onlyManager {
    require(
      !reservesSent,
      "Reserved tokens has already been sent"
    );
    reservesSent = true;
    uint256 totalBank = token.totalSupply();

    require(companyPart != 0 && companyWallet != address(0));
    
    uint256 multipliedAmount = totalBank.mul(companyPart);
    require(multipliedAmount > totalBank);
    
    uint256 companyTokensAmount = multipliedAmount.div(100);
    require(companyTokensAmount.mul(100) == multipliedAmount);

    token.addHolderToFridge(companyWallet);
    token.transfer(companyWallet, companyTokensAmount);
  }

  /**
  * @dev Send ether for buyers wallets
  */
  function refundEther()
   onlyManager
   nonReentrant
   public
   returns(bool)
  {
    for (uint256 i = 0; i < whiteList.length; i++) {
      if (!investor[whiteList[i]].etherRefunded && investor[whiteList[i]].weiSent > 0) {
        emit EtherRefunded(
          whiteList[i],
          investor[whiteList[i]].weiSent
        );
        investor[whiteList[i]].etherRefunded = true;
        whiteList[i].transfer(investor[whiteList[i]].weiSent);
      } else if (!investor[whiteList[i]].etherRefunded && investor[whiteList[i]].weiSent > 0) {
        emit EtherRefunded(
          whiteList[i],
          0
        );
        investor[whiteList[i]].etherRefunded = true;
      }
    }
    return true;
  }

  /**
  * @dev Calculating tokens amount, if ETH value comes to contract
  * @param _ethAmount uint256 Amount of sent ether
  * @param _to address The address which you want to transfer to
  */
  function getEthAndStore(
    uint256 _ethAmount,
    address _to
  )
   whitelisted
   distributionIsOn
   nonZeroAddress(_to)
   nonReentrant
   internal
  {
    uint256 oldWeiAccumulated = totalWeiAccumulated;
    totalWeiAccumulated = totalWeiAccumulated.add(_ethAmount); 
    require(totalWeiAccumulated != oldWeiAccumulated);
    
    uint256 oldWeiSent = investor[_to].weiSent;
    investor[_to].weiSent = (investor[_to].weiSent).add(_ethAmount);
    require(investor[_to].weiSent != oldWeiSent);
  }

  /**
  * @dev This will return how much tokens should be sent to investor
  * @param _investor Address of whitelisted participant
  */
  function getAmountOfTokensToSend(
    address _investor
  )
   public
   view
   onlyManager
   returns(uint256)
  { 
    uint256 ethValue = investor[_investor].weiSent;
    return ethValue.div(rate);
  }
  
  
  /**
  * @dev Sending tokens to the recipient, based on calculation on BTC amount
  *      Don't need to care about Token decimals 
  * @param _amount uint256 Amount of tokens to send
  * @param _to address The address which you want to transfer to
  */
  function sendTokens(
    address _to,
    uint256 _amount
  )
   checkDistributionState
   onlyManager
   nonZeroAddress(_to)
   validAmountForManualSend(_amount)
   nonReentrant
   public
  {
    uint256 oldSoldAmount = totalSold;
    totalSold = totalSold.add(_amount);
    require(totalSold != oldSoldAmount);

    uint256 oldInvestorAmount = investor[_to].totalAmount;
    investor[_to].totalAmount = (investor[_to].totalAmount).add(_amount);
    require(investor[_to].totalAmount != oldInvestorAmount);

    require(distributeToken(_to, _amount));
  }
  
  /**
   * @dev Distibutes tokens, based on current distribution state
   * @notice If the current state is PUBLIC, don't need to freeze tokens
   * @param _to Address of holder whose tokens must be distributed
   * @param _amount Quantity of tokens to distribute
  */
  function distributeToken(
    address _to,
    uint256 _amount
  ) 
   internal
   nonZeroAddress(_to)
   returns(bool)
  {
    if(distributionState == State.PRIVATE) {
      require(token.addHolderToFridge(_to));
      require(token.transfer(_to, _amount.mul(decimals)));
    }
    else 
      require(token.transfer(_to, _amount.mul(decimals)));

    return true;
  }
  
  /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  *  ONLY DEVELOPMENT
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
  /**
  * @dev Show contract balance
  */
  function contractBalance() public view returns(uint256) {
    return address(this).balance;
  }

  /**
  * @dev Returns the number of tokens in the buyer's wallet
  */
  function myBalance() public view returns(uint256) {
    return token.balanceOf(msg.sender);
  }

  /**
  * @dev Returns number of supplied tokens
  */
  function tokensSupply() public view returns(uint256) {
    return token.totalSupply();
  }
  
  /**
   * @dev Returns the number of tokens at Crowdsale smart contact
  */
  function contractTokenBalance() public view returns(uint256) {
    return token.balanceOf(this);
  }

  function getValidPurchase() public view returns(uint256) {
    uint256 investorsTokenPart = (((token.totalSupply()).mul(investorsPart)).div(100)).div(decimals);
    return (investorsTokenPart.mul(10)).div(100);
  }
  /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  *  DELETE ON PRODUCTION
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

  /**
   * @dev Update an ICO timestamp finish date
   * @param _time is a number of days to add to ICO finish date 
  */
  function increaseIcoDuration(
    uint256 _time
  )
   public
   onlyManager
   nonReentrant
   returns(bool)
  {
    require(
      _time != uint256(0),
      "You can not increase for 0, set more days to increase ico duration"
    );
    uint256 oldDuration = ICODuration;
    ICODuration = ICODuration.add(_time * 1 minutes);
    require(ICODuration != oldDuration);
    return true;
  }

  /**
  * @dev Sets new company wallet address to which the accumulated ether will be sent
  * @param newCompanyWallet address
  */
  function setcompanyWallet(
    address newCompanyWallet
  ) 
   public
   nonZeroAddress(newCompanyWallet)
   onlyManager
   nonReentrant
   returns(bool)
  {
    address oldCompanyWallet = companyWallet;
    companyWallet = newCompanyWallet;
    require(companyWallet != oldCompanyWallet);
    emit NewCompanyWallet(newCompanyWallet);
    return true;
  }
}
