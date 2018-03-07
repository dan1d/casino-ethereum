pragma solidity 0.4.19;

contract Casino {
  address public owner;
  uint256 public minimumBet;
  uint256 public totalBet = 0;
  uint256 public numberOfBets;
  uint256 public maxAmountOfBets = 100;
  address[] public players;

  struct Player {
    uint256 amountBet;
    uint256 numberSelected;
  }

  mapping(address => Player) public playerInfo;

  function Casino(uint256 _minimumBet, uint256 _maxBets) public {
    owner = msg.sender;
    if(_minimumBet != 0) minimumBet = _minimumBet;
    if(_maxBets > 1) maxAmountOfBets = _maxBets;
  }

  function kill() public {
    if(msg.sender == owner) selfdestruct(owner);
  }

  function checkPlayerExist(address player) public constant returns(bool){
    for(uint256 i = 0; i < players.length; i++){
      if(players[i] == player) return true;
    }
    return false;
  }

  function bet(uint256 numberSelected) public payable {
    require(!checkPlayerExist(msg.sender));
    require(numberSelected >= 1 && numberSelected <= 10);
    require(msg.value >= minimumBet);

    playerInfo[msg.sender].amountBet = msg.value;
    playerInfo[msg.sender].numberSelected = numberSelected;
    numberOfBets++;
    players.push(msg.sender);
    totalBet += msg.value;
    if(numberOfBets == maxAmountOfBets) finishBet();
  }

  function finishBet() public {
    uint256 numberGenerated = block.number % 10 + 1;
    distributePrizes(numberGenerated);
  }

  function distributePrizes(uint256 winnerNumber) public {
    address[100] memory winners;
    uint256 count = 0;

    for(uint256 i = 0; i < players.length; i++){
      address playerAddress = players[i];
      if(playerInfo[playerAddress].numberSelected == winnerNumber){
        winners[count] = playerAddress;
        count++;
      }
      delete playerInfo[playerAddress];
    }

    resetData();
    uint256 winnerEtherAmmount = totalBet / winners.length;

    for(uint256 j = 0; j < winners.length; j++){
      if(winners[j] != address(0)) winners[j].transfer(winnerEtherAmmount);
    }
  }

  function() public payable {
    
  }

  function resetData() private {
    players.length = 0;
    totalBet = 0;
    numberOfBets = 0;
  }
}
