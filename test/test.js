const Crowdsale = artifacts.require('../contracts/Crowdsale.sol'),
      Token     = artifacts.require('../contracts/SingleToken.sol'),
      Ownable   = artifacts.require('../contracts/Ownable.sol'),
      Managed   = artifacts.require('../contracts/Managed.sol'),
      Reentrant = artifacts.require('../contracts/ReentrancyGuard.sol'),
      _owner    = web3.eth.accounts[0],
      _accounts = web3.eth.accounts,
      _gas      = 300000,
      _ether    = 1000000000000000000;

const toDecimal = (obj) => {
  return web3._extend.utils.toDecimal(obj)
}

contract('Crowdsale', async () => {

  it(`owner should be ${_owner}`, async () => {
    const crowdsale = await Crowdsale.deployed(),
          owner     = await crowdsale.owner.call();

    assert.equal(Number(_owner), Number(owner));
  });

  it(`ecosystem part should be 40%`, async () => {
    const crowdsale     = await Crowdsale.deployed(),
          ecosystemPart = await crowdsale.ecosystemPart.call();

    assert.equal(toDecimal(ecosystemPart), 40)
  });

  it(`community part should be 40%`, async () => {
    const crowdsale     = await Crowdsale.deployed(),
          investorsPart = await crowdsale.investorsPart.call();

    assert.equal(toDecimal(investorsPart), 40)
  });
  
  it(`company part should be 20%`, async () => {
    const crowdsale   = await Crowdsale.deployed(),
          companyPart = await crowdsale.companyPart.call();

    assert.equal(toDecimal(companyPart), 20)
  });

  it(`rate should be not 0`, async () => {
    const crowdsale = await Crowdsale.deployed(),
          rate      = toDecimal(await crowdsale.rate.call());

    assert.notEqual(0, rate);
  });

  it(`investors part should be % of total supply`, async () => {
    const crowdsale     = await Crowdsale.deployed(),
          totalSupply   = toDecimal(await crowdsale.tokensSupply.call()),
          investorsPart = toDecimal(await crowdsale.investorsPart.call()),
          decimals      = toDecimal(await crowdsale.decimals.call());

    assert.equal(400000000 * decimals, totalSupply*investorsPart/100);
  });

  it(`contract balance should be 0 at start`, async () => {
    const crowdsale       = await Crowdsale.deployed(),
          contractBalance = toDecimal(await crowdsale.contractBalance.call());

    assert.equal(contractBalance, 0);
  });

  it(`owner of crowdsale smart contract should not have Tokens on start`, async () => {
    const crowdsale    = await Crowdsale.deployed(),
          tokenBalance = toDecimal(await crowdsale.myBalance.call());

    assert.equal(tokenBalance, 0);
  });

  it(`crowdsale smart contract should have tokens on balance`, async () => {
    const crowdsale            = await Crowdsale.deployed(),
          contractTokenBalance = toDecimal(await crowdsale.contractTokenBalance.call()),
          tokenDecimals        = toDecimal(await crowdsale.decimals.call());

    assert.equal(1000000000 * tokenDecimals, contractTokenBalance);
  });

  it(`should revert all onlyManager functions, when called not from manager`, async () => {
    const crowdsale = await Crowdsale.deployed();
    let reverts     = 0;
    try {
      await crowdsale.setFreezingPeriod(1000, { from: _owner });
    } catch (error) {
      const revertFound = error.message.search('revert') >= 0;
      assert.equal(revertFound, true);
      ++reverts;
      console.log(`       Was a revert found at setFreezingPeriod? ${revertFound}`);
    }

    try { 
      await crowdsale.addBuyer(_owner, { from: _owner });
    } catch (error) {
      const revertFound = error.message.search('revert') >= 0;
      assert.equal(revertFound, true);
      ++reverts;
      console.log(`       Was a revert found at addBuyer? ${revertFound}`);
    }

    try { 
      await crowdsale.delBuyer(_owner, { from: _owner });
    } catch (error) {
      const revertFound = error.message.search('revert') >= 0;
      assert.equal(revertFound, true);
      ++reverts;
      console.log(`       Was a revert found at delBuyer? ${revertFound}`);
    }

    try { 
      await crowdsale.startICO({ from: _owner });
    } catch (error) {
      const revertFound = error.message.search('revert') >= 0;
      assert.equal(revertFound, true);
      ++reverts;
      console.log(`       Was a revert found at startICO? ${revertFound}`);
    }

    try { 
      await crowdsale.stopICO({ from: _owner });
    } catch (error) {
      const revertFound = error.message.search('revert') >= 0;
      assert.equal(revertFound, true);
      ++reverts;
      console.log(`       Was a revert found at stopICO? ${revertFound}`);
    }

    try { 
      await crowdsale.refundEther({ from: _owner });
    } catch (error) {
      const revertFound = error.message.search('revert') >= 0;
      assert.equal(revertFound, true);
      ++reverts;
      console.log(`       Was a revert found at refundEther? ${revertFound}`);
    }

    try { 
      await crowdsale.sendTokens(_owner, 1000, { from: _owner });
    } catch (error) {
      const revertFound = error.message.search('revert') >= 0;
      assert.equal(revertFound, true);
      ++reverts;
      console.log(`       Was a revert found at sendTokens? ${revertFound}`);
    }

    try { 
      await crowdsale.increaseIcoDuration(10, { from: _owner });
    } catch (error) {
      const revertFound = error.message.search('revert') >= 0;
      assert.equal(revertFound, true);
      ++reverts;
      console.log(`       Was a revert found at increaseIcoDuration? ${revertFound}`);
    }

    try { 
      await crowdsale.setcompanyWallet(_owner, { from: _owner });
    } catch (error) {
      const revertFound = error.message.search('revert') >= 0;
      assert.equal(revertFound, true);
      ++reverts;
      console.log(`       Was a revert found at setcompanyWallet? ${revertFound}`);
    }

    assert.equal(9, reverts);
  });

  it(`should add whitelisted private sale participant`, async () => {
    const buyer     = _accounts[1],
          crowdsale = await Crowdsale.deployed(),
          oldList   = await crowdsale.showBuyers.call();
    await crowdsale.addManager(_owner, { from: _owner, gas: _gas});
    await crowdsale.addBuyer(buyer, { from: _owner, gas: _gas });
    const newList = await crowdsale.showBuyers.call();
    assert.equal(oldList.length + 1, newList.length);
  })

  it(`should show whitelisted participants as array`, async () => {
    const crowdsale = await Crowdsale.deployed(),
          whiteList = await crowdsale.showBuyers.call();

    assert.notEqual(whiteList.length, 0);
  });

  it(`should add freezing period to token`, async () => {
    const crowdsale = await Crowdsale.deployed(),
          tokenAddr = await crowdsale.token.call()
          token     = await Token.at(tokenAddr),
          buyer     = _accounts[1];

    await crowdsale.setFreezingPeriod(3600, { from: _owner, gas: _gas });
    const freezedUntil = token.freezedUntil.call();
    assert.notEqual(freezedUntil, 0);
  });

  it(`should start ICO round`, async () => {
    const crowdsale = await Crowdsale.deployed();
    await crowdsale.startICO({ from: _owner, gas: 300000 });
    const runs = await crowdsale.ICOState.call();
    assert.equal(runs, true);
  });

  it(`should increase ICO duration`, async () => {
    const crowdsale   = await Crowdsale.deployed(),
          oldDuration = toDecimal(await crowdsale.ICODuration.call());

    await crowdsale.increaseIcoDuration(1000, { from: _owner, gas: _gas })
    const newDuration = toDecimal(await crowdsale.ICODuration.call());

    assert.equal(oldDuration + 60000, newDuration)
  });

  it(`should send tokens to investor`, async () => {
    const crowdsale = await Crowdsale.deployed(),
          buyer     = _accounts[1],
          tokenAddr = await crowdsale.token.call(),
          token     = await Token.at(tokenAddr),
          tokenHold = toDecimal(await token.balanceOf.call(buyer)),
          decimals  = await crowdsale.decimals.call(),
          atTotal   = toDecimal(await crowdsale.tokensSupply.call()),
          invPart   = toDecimal(await crowdsale.investorsPart.call());

    try {
      await crowdsale.sendTokens(
        buyer,
        atTotal * invPart * 0.11, // 11% when max is 10%
        {
          from: _owner,
          // gas: _gas
        }
      );
    } catch (error) {
      const revertFound = error.message.search('revert') >= 0;
      assert.equal(revertFound, true);
      console.log(`       Was a revert found at sending 11% of investors token amount? ${revertFound}`);
    }
    
    await crowdsale.sendTokens(
      buyer,
      1000,
      {
        from: _owner,
        // gas: _gas
      }
    );

    const newTokenHold = toDecimal(await token.balanceOf.call(buyer));
    assert.equal(tokenHold + 1000, newTokenHold / decimals);
  });

  it(`transfer should be reverted during the freezing period`, async () => {
    const crowdsale = await Crowdsale.deployed(),
          buyer     = _accounts[1],
          friend    = _accounts[3],
          tokenAddr = await crowdsale.token.call(),
          token     = await Token.at(tokenAddr),
          myBalance = await token.balanceOf.call(buyer);
    
    try {
      await token.transfer(
        friend, 
        myBalance * 0.5,
        { from: buyer, gas: _gas }
      );
    } catch (error) {
      const revertFound = error.message.search('revert') >= 0;
      assert.equal(revertFound, true);
      console.log(`       Was a revert found at transfer? ${revertFound}`);
    }
  });

  it(`should set company wallet address`, async () => {
    const crowdsale = await Crowdsale.deployed(),
          oldWallet = await crowdsale.companyWallet.call();
          company   = _accounts[2];

    await crowdsale.setcompanyWallet(company, { from: _owner, gas: _gas });
    const newWallet = await crowdsale.companyWallet.call();
    assert.notEqual(Number(newWallet), Number(oldWallet));
  });

  it(`should receive ethers`, async () => {
    const crowdsale = await Crowdsale.deployed(),
          buyer     = _accounts[1];

    await crowdsale.purchase(
      buyer,
      {
        from: buyer,
        gas: _gas,
        value: _ether
      }
    );
    const balance = toDecimal(await crowdsale.contractBalance.call());
    assert.notEqual(balance, 0);
  });

  it(`should show how much tokens to send for investor`, async () => {
    const crowdsale = await Crowdsale.deployed(),
          buyer     = _accounts[1],
          stats     = await crowdsale.investor.call(buyer),
          tokenRate = toDecimal(await crowdsale.rate.call());
          amount    = toDecimal(await crowdsale.getAmountOfTokensToSend.call(buyer));

    assert.equal(toDecimal(stats[1]) / tokenRate, amount);
  });

  it(`should keep stats for investor`, async () => {
    const crowdsale = await Crowdsale.deployed(),
          buyer     = _accounts[1];
          stats     = await crowdsale.investor.call(buyer);

    assert.equal(stats[0], true);
    assert.equal(toDecimal(stats[1]), _ether);
    assert.equal(toDecimal(stats[2]), 1000);
    assert.equal(toDecimal(stats[3]), false);
  });

  /**
   * @dev UNCOMMENT THIS AND COMMENT TEST AT LINE 403
   * TO CHECH THE REFUNDING TO INVESTORS
  */
  it(`should refund ethers by one click`, async () => {
    const crowdsale     = await Crowdsale.deployed(),
          oldBalance    = await crowdsale.contractBalance.call(),
          buyerAddress  = _accounts[1];
          oldInvBalance = toDecimal(await web3.eth.getBalance(buyerAddress));

    await crowdsale.refundEther({ from: _owner, gas: _gas });
    const newBalance = await crowdsale.contractBalance.call();
    assert.notEqual(oldBalance, newBalance);
    assert.equal(newBalance, 0);

    const investorStruct = await crowdsale.investor.call(buyerAddress),
          investment     = toDecimal(investorStruct[1]);
          newInvBalance  = toDecimal(await web3.eth.getBalance(buyerAddress));

    assert.equal(oldInvBalance + investment, newInvBalance)
  });

  it(`should record refunding to stats`, async () => {
    const crowdsale = await Crowdsale.deployed(),
          buyer     = _accounts[1],
          _investor = await crowdsale.investor.call(buyer),
          refunded  = _investor[3];
    
    assert.equal(refunded, true);
  });

  it(`should keep stats on sold tokens`, async () => {
    const crowdsale = await Crowdsale.deployed(),
          buyer     = _accounts[1];
          sold      = toDecimal(await crowdsale.totalSold.call()); 
    
    assert.notEqual(sold, 0)
  });

  it(`should STOP ico`, async () => {
    const crowdsale   = await Crowdsale.deployed(),
          tokenAddr   = await crowdsale.token.call(),
          company     = _accounts[2],
          token       = await Token.at(tokenAddr),
          oldBalance  = toDecimal(await token.balanceOf.call(company)),
          companyPart = toDecimal(await crowdsale.companyPart.call()),
          totalAmount = toDecimal(await crowdsale.tokensSupply.call()),
          oldFreezed  = await token.ifFreezedHolder.call(company);
    
    await crowdsale.stopICO({ from: _owner, gas: _gas });
    const newBalance = toDecimal(await token.balanceOf.call(company)),
          shouldBe   = companyPart * totalAmount / 100,
          newFreezed = await token.ifFreezedHolder.call(company);

    assert.equal(oldFreezed, false);
    assert.equal(newFreezed, true);
    
    assert.equal(oldBalance, 0);
    assert.equal(newBalance, shouldBe);
  });

  /**
   * @DEV COMMENT IT TO TEST REFUNDING
  */
  // it(`should withdraw etheres to company wallet`, async () => {
  //   const crowdsale  = await Crowdsale.deployed(),
  //         balance = toDecimal(await crowdsale.contractBalance.call());

  //   assert.equal(balance, 0);
  // });

  it(`should delete private sale participant`, async () => {
    const crowdsale  = await Crowdsale.deployed(),
          buyer      = _accounts[1],
          buyerState = await crowdsale.investor.call(buyer);

    await crowdsale.delBuyer(buyer, { from:_owner, gas: _gas });
    const newBuyerState = await crowdsale.investor.call(buyer);
    assert.notEqual(buyerState[0], newBuyerState[0]);
    assert.equal(newBuyerState[0], false);
  });

});

contract(`Ownable`, async () => {

  it(`Owner should be ${_owner}`, async () => {
    const ownalbe = await Ownable.deployed(),
            owner = await ownalbe.owner.call();
    assert.equal(Number(owner), Number(_owner));
  });

  it(`should revert when called from not owner`, async () => {
    const ownalbe = await Ownable.deployed();
    try {
        await ownalbe.transferOwnership(_owner, {
            from: _accounts[1]
        });
    } catch (error) {
        const revertFound = error.message.search('revert') >= 0;
        assert.equal(revertFound, true);
        console.log(`       Was a revert found? ${revertFound}`);
    }
  });

  it(`should transfer ownership`, async () => {
    const ownalbe = await Ownable.deployed();
    await ownalbe.transferOwnership(_accounts[1], { from: _owner });
    const currentOwner = await ownalbe.owner.call();
    assert.notEqual(Number(_owner), Number(currentOwner));
  });

  it(`should relinquish control of the contract`, async () => {
    const ownalbe = await Ownable.deployed(),
     currentOwner = await ownalbe.owner.call();
    
    await ownalbe.renounceOwnership({ from:currentOwner });
    const newOwner = await ownalbe.owner.call();
    assert.notEqual(Number(newOwner), Number(currentOwner));
  });

});

contract('Token', async () => {

  it(`name should be defined`, async () => {
    const token = await Token.deployed(),
          name  = await token.name.call();
    assert.notEqual(name, String(''));
  });

  it(`symbol should be defined`, async () => {
    const token  = await Token.deployed(),
          symbol = await token.symbol.call();
    assert.notEqual(symbol, String(''));
  });

  it(`decimals should be defined`, async () => {
    const token    = await Token.deployed(),
          decimals = toDecimal(await token.decimals.call());
    assert.notEqual(decimals, 0);
  });

  it(`totalSypply should be not 0`, async () => {
    const token  = await Token.deployed(),
          supply = toDecimal(await token.totalSupply_.call());
    assert.notEqual(supply, 0);
  });

  it(`balance of issuer should be non 0`, async () => {
    const token   = await Token.deployed(),
          balance = toDecimal(await token.balanceOf.call(_owner));
    assert.notEqual(balance, 0);
  });

  it(`balance of issuer should be equal to totalSupply`, async () => {
    const token   = await Token.deployed(),
          supply  = toDecimal(await token.totalSupply_.call()),
          balance = toDecimal(await token.balanceOf.call(_owner));
    assert.equal(supply, balance);
  });

  it(`should transfer tokens`, async () => {
    const token       = await Token.deployed(),
          receiverOld = toDecimal(await token.balanceOf.call(_accounts[1])),
          senderOld   = toDecimal(await token.balanceOf.call(_owner)),
          amount      = 1000;

    await token.transfer(_accounts[1], amount);
    const receiverNew = toDecimal(await token.balanceOf.call(_accounts[1])),
          senderNew   = toDecimal(await token.balanceOf.call(_owner));
    
    assert.equal(receiverNew - amount, receiverOld);
    assert.equal(senderNew + amount, senderOld);
  });

  it(`should reject if not enought tokens to send on sender address`, async () => {
    const token = await Token.deployed();
    try {                         // random big amount
      await token.transfer(_accounts[1], 1234161224)
    }
    catch (error) {
      const revertFound = error.message.search('revert') >= 0;
      assert.equal(revertFound, true);
      console.log(`       Was a revert found? ${revertFound}`);
    }
  });

  it(`should add allowance to spend amount of tokens`, async () => {
    const token        = await Token.deployed(),
          amount       = 10000,
          _spender     = _accounts[1],
          oldAllowance = toDecimal(await token.allowance.call(_owner, _spender));

    await token.approve(_accounts[1], amount);
    const newAllowance = toDecimal(await token.allowance.call(_owner, _spender));

    assert.notEqual(oldAllowance, newAllowance);
    assert.equal(newAllowance - amount, oldAllowance);
  });

  it(`should succed transferFrom ${_owner}`, async () => {
    const token  = await Token.deployed(),
          _from  = _owner,
          _to    = _accounts[1],
          amount = toDecimal(await token.allowance.call(_from, _to));

    const old_toBalance   = toDecimal(await token.balanceOf.call(_to)),
          old_fromBalance = toDecimal(await token.balanceOf.call(_from));

    await token.transferFrom(_from, _to, amount, { from: _to });
    const newAllowanceAmount = toDecimal(await token.allowance.call(_from, _to)),
          new_toBalance      = toDecimal(await token.balanceOf.call(_to)),
          new_fromBalance    = toDecimal(await token.balanceOf.call(_from));

    assert.notEqual(newAllowanceAmount, amount);
    assert.equal(newAllowanceAmount + amount, amount);
    assert.equal(new_toBalance - amount, old_toBalance);
    assert.equal(new_fromBalance + amount, old_fromBalance);
  });

  it(`should increase allowance to spend`, async () => {
    const token  = await Token.deployed(),
          _to    = _accounts[1],
          amount = 1000,
    oldAllowance = toDecimal(await token.allowance.call(_owner, _to));

    await token.increaseApproval(_to, amount, { from: _owner });
    const newAllowance = toDecimal(await token.allowance.call(_owner, _to));

    assert.notEqual(oldAllowance, newAllowance);
    assert.equal(oldAllowance + amount, newAllowance);
  });

  it(`should decrease allowance to spend`, async () => {
    const token  = await Token.deployed(),
          _to    = _accounts[1],
          amount = 500,
    oldAllowance = toDecimal(await token.allowance.call(_owner, _to));

    await token.decreaseApproval(_to, amount, { from: _owner });
    const newAllowance = toDecimal(await token.allowance.call(_owner, _to));

    assert.equal(newAllowance + amount, oldAllowance);
  });

  it(`should revert if spender trying to spend more than allowed`, async () => {
    const token  = await Token.deployed(),
          _from  = _owner,
          _to    = _accounts[1],
          amount = toDecimal(await token.allowance.call(_from, _to));
    
    try {                     
      await token.transferFrom(
        _from, _to, amount * 5, // amount biger in 5 times then allowed
        { from: _to }
      );
    } 
    catch (error) {
      const revertFound = error.message.search('revert') >= 0;
      assert.equal(revertFound, true);
      console.log(`       Was a revert found? ${revertFound}`);
    }
  });

  it(`should revert if spender withdrawing more, than holder have`, async () => {
    const token   = await Token.deployed(),
          _from   = _owner,
          _to     = _accounts[1],
          balance = toDecimal(await token.balanceOf.call(_from)) * 2;
    
    await token.approve(_to, balance, { from: _owner });
    const allowedAmount = toDecimal(await token.allowance.call(_from, _to));

    try {
      await token.transferFrom(
        _from, _to, balance,
        { from: _to }
      )
    }
    catch (error) {
      const revertFound = error.message.search('revert') >= 0;
      assert.equal(revertFound, true);
      console.log(`       Was a revert found? ${revertFound}`);
    }
  });

  it(`should set freezing period`, async () => {
    const token   = await Token.deployed(),
          timeAdd = 1000,
     freezedUntil = toDecimal(await token.freezedUntil.call());

    await token.freeze(timeAdd, { from: _owner });
    const newFreezedUntil = toDecimal(await token.freezedUntil.call());

    assert.equal(newFreezedUntil - timeAdd, freezedUntil + Math.floor(Date.now() / 1000));
  });

  it(`should freeze tokens for holder`, async () => {
    const token  = await Token.deployed(),
          holder = _accounts[1],
          status = await token.ifFreezedHolder.call(holder);
    
    await token.addHolderToFridge(_accounts[1], { from: _owner });
    const newStatus = await token.ifFreezedHolder.call();

    assert.notEqual(newStatus, status);
  });

  it(`should return list of freezed holders`, async () => {
    const token  = await Token.deployed(),
          list   = await token.getFreezedHoldersList.call();

    assert.equal(typeof(list), 'object');
    assert.notEqual(list.length, 0);
  });

  it(`should record holder as freezed`, async () => {
    const token  = await Token.deployed(),
          holder = _accounts[1],
          list   = await token.getFreezedHoldersList.call(),
          length = list.length;

    assert.notEqual(length, 0);
    assert.equal(list[length-1], holder);
  });

  it(`should return status of freezing for passed address`, async () => {
    const token   = await Token.deployed(),
          holder  = _accounts[1],
          freezed = await token.ifFreezedHolder.call(holder);

    assert.equal(freezed, true);
  });

  it(`should revert when tokens freezed for holder`, async () => {
    const token   = await Token.deployed(),
          holder  = _accounts[1];

    try {
      await token.transfer(_accounts[2], 100, { from: holder });
    }
    catch (error) {
      const revertFound = error.message.search('revert') >= 0;
      assert.equal(revertFound, true);
      console.log(`       Was a revert found? ${revertFound}`);
    }
  });

  it(`should revert on calling transferFrom when tokens are freezed`, async () => {
    const token    = await Token.deployed(),
          _spender = _accounts[1],
          _amount  = toDecimal(await token.allowance.call(_owner, _spender));
    
    try {
      await token.transferFrom(
        _owner, _spender, _amount,
        { from: _spender }
      );
    }
    catch (error) {
      const revertFound = error.message.search('revert') >= 0;
      assert.equal(revertFound, true);
      console.log(`       revert found? ${revertFound}`);
    }

  });
  it(`should revert on calling approve when tokens are freezed`, async () => {
    const token    = await Token.deployed(),
          _spender = _accounts[2],
          _holder  = _accounts[1],
          _amount  = 1000;

    try {
      await token.approve(_spender, _amount, { from: _holder });
    }
    catch (error) {
      const revertFound = error.message.search('revert') >= 0;
      assert.equal(revertFound, true);
      console.log(`       Was a revert found? ${revertFound}`);
    }

  });
  it(`should revert on calling increaseApproval when tokens are freezed`, async () => {
    const token    = await Token.deployed(),
          _spender = _accounts[2],
          _holder  = _accounts[1],
          _amount  = 1000;

    try {
      await token.increaseApproval(_spender, _amount, { from: _holder });
    }
    catch (error) {
      const revertFound = error.message.search('revert') >= 0;
      assert.equal(revertFound, true);
      console.log(`       Was a revert found? ${revertFound}`);
    }

  });
  it(`should revert on calling decreaseApproval when tokens are freezed`, async () => {
    const token    = await Token.deployed(),
          _spender = _accounts[2],
          _holder  = _accounts[1],
          _amount  = 1000;

    try {
      await token.decreaseApproval(_spender, _amount, { from: _holder });
    }
    catch (error) {
      const revertFound = error.message.search('revert') >= 0;
      assert.equal(revertFound, true);
      console.log(`       Was a revert found? ${revertFound}`);
    }

  });

});

contract('Managed', async () => {

  it(`should add manager`, async () => {
    const managed        = await Managed.deployed(),
          oldManagerList = await managed.managerList.call(),
          oldListLength  = oldManagerList.length;

    await managed.addManager(_owner, { from: _owner, gas: _gas });
    const managerList = await managed.managerList.call();
    assert.equal(oldListLength + 1, managerList.length);
    assert.equal(Number(_owner), Number(managerList[0]));
  });

  it(`number of managers shuold increase when add manager`, async () => {
    const managed     = await Managed.deployed(),
          managerList = await managed.managerList.call(),
          listLength  = managerList.length;
    assert.notEqual(listLength, 0);
  });

  it(`should delete manager`, async () => {
    const managed = await Managed.deployed(),
          oldList = await managed.managerList.call();

    await managed.deleteManager(_owner, { from: _owner, gas: _gas });
    const newList = await managed.managerList.call();
    assert.equal(oldList.length - 1, newList.length);
  });

});