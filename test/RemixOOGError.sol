pragma solidity ^0.4.2;

contract Send {
    constructor() public payable{}
    
    function () public payable{}
    
    function getBalance() public view returns (uint balance){
        balance = address(this).balance;
        return balance;
    }
    
    function transfer(address[] receiver, uint256 amount) public payable returns(bool){
        for(uint i = 0; i < receiver.length; i++){
            receiver[i].transfer(amount);
        }
        return true;
    }   
}