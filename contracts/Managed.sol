pragma solidity 0.4.24;

import "./Ownable.sol";
import "./ReentrancyGuard.sol";
import "./SafeMath.sol";

contract Managed is Ownable, ReentrancyGuard {

  using SafeMath for uint256;

  /**
  * @dev keeping addresses who allowed to 
    exec onlyManager functions
  * @knownIssue "private" modifier don't make it invisible
  */
  address[] private managers;
  mapping (address => bool) private isManager;

  /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  *  EVENTS
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */  
  event NewManagerAdded (address indexed managerAddress);

  event ManagerDeleted (address indexed managerAddress);

  /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  *  MODIFIERS
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */ 
  /**
  * @dev Determine that manager is valid
  */
  modifier isActiveManager(address _manager) {
    require(_manager != address(0));
    require(
      isManager[_manager],
      "Manager address is not exists"
    );
    _;
  }

  /**
  * @dev Determine that caller is allowed for onlyManager functions
  */
  modifier onlyManager () {
    bool status = isManager[msg.sender];
    require(
      status,
      "This function allowed only for managers. Ask devs if you must be a manager"
    );
    _;
  }


  /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
  *  CONTRACT BODY
  * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */ 
  /**
  * @dev Adds new manager, called from backend
  */
  function addManager(
    address newManager
  )
   public
   onlyOwner
   nonReentrant
  {
    require(
      !isManager[newManager],
      "This address is already a manager"
    );
    require(managers.length < 10);

    managers.push(newManager);
    isManager[newManager] = true;
    emit NewManagerAdded(newManager);
  }

  /**
  * @dev delete manager and clean gap in array
  * takes more gas, but more flexible
  * @notice "COSTLY LOOP ISSUE": fixed with line 67. Array of manager can be up to 10 records,
  * it won't cause exceding block gas limit issue
  */
  function deleteManager(
    address newManager
  )
   public
   onlyOwner
   isActiveManager(newManager)
   nonReentrant
  {
    for (uint256 i; i < managers.length-1; i.add(1)){
      uint256 nextIndex = i.add(1);
      managers[i] = managers[nextIndex];
    }
    delete isManager[newManager];
    delete managers[(managers.length).sub(1)];
    managers.length--;
    emit ManagerDeleted(newManager);
  }

  /**
  * @dev returns the array of managers
  */
  function managerList()
   public
   view
   onlyOwner
   returns(address[])
  {
    return managers;
  }

}
