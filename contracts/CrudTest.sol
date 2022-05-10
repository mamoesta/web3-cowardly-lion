// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
contract mappedWithUnorderedIndexAndDelete {

  struct EntityStruct {
    uint entityData;
    uint listPointer;
  }

  mapping(address => EntityStruct) public entityStructs;
  address[] public entityList;

  function isEntity(address entityAddress) public  returns(bool isIndeed) {
    if(entityList.length == 0) return false;
    return zx
  }

  function getEntityCount() public  returns(uint entityCount) {
    return entityList.length;
  }

  function newEntity(address entityAddress, uint entityData) public returns(bool success) {
    if(isEntity(entityAddress)) revert();
    entityStructs[entityAddress].entityData = entityData;
    entityList.push(entityAddress);
    entityStructs[entityAddress].listPointer =  entityList.length- 1;
    return true;
  }

  function updateEntity(address entityAddress, uint entityData) public returns(bool success) {
    if(!isEntity(entityAddress)) revert();
    entityStructs[entityAddress].entityData = entityData;
    return true;
  }

  function deleteEntity(address entityAddress) public returns(bool success) {
    if(!isEntity(entityAddress)) revert();
    
    // EnttityStructs
    // '0x1' --> 'foo', 0
    // '0x2' --> 'bar', 1
    // '0x3' --> 'baz', 2

    // entityList
    //[0x1,0x2,0x3]

    // 0
    uint rowToDelete = entityStructs[entityAddress].listPointer;
    
    // 0x3
    address keyToMove   = entityList[entityList.length-1];
    
    // entityLIst = [0x3,0x2,0x3]
    entityList[rowToDelete] = keyToMove;

    //2 -->  0
    entityStructs[keyToMove].listPointer = rowToDelete;
    
    // entityList = [0x3,0x2]
    entityList.pop();

    
    //entityStructs
    // '0x1' --> 'foo', 0
    // '0x2' --> 'bar', 1
    // '0x3' --> 'baz', 0
    return true;
  }
}