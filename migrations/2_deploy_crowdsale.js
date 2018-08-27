const DistributionContract = artifacts.require('../contracts/ICO/Crowdsale.sol'),
                   Ownable = artifacts.require('../contracts/Ownable.sol'),
                   Managed = artifacts.require('../contracts/Managed.sol'),
                     Token = artifacts.require('../contracts/SingleToken.sol');


module.exports = function(deployer){
    deployer.deploy(DistributionContract)
    deployer.deploy(Ownable);
    deployer.deploy(Managed);
    deployer.deploy(Token);
}
