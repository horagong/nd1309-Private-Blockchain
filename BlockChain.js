/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

const SHA256 = require('crypto-js/sha256');
const LevelSandbox = require('./LevelSandbox.js');
const Block = require('./Block.js');

class Blockchain {

    constructor() {
        this.bd = new LevelSandbox.LevelSandbox();
        this.generateGenesisBlock();
    }

    // Helper method to create a Genesis Block (always with height= 0)
    // You have to options, because the method will always execute when you create your blockchain
    // you will need to set this up statically or instead you can verify if the height !== 0 then you
    // will not create the genesis block
    generateGenesisBlock(){
        // Add your code here
        let block = new Block.Block("Genesis block");
        block.time = new Date().getTime().toString().slice(0, -3);
        block.hash = SHA256(JSON.stringify(block)).toString();
        return this.bd.addLevelDBData(0, JSON.stringify(block))
        .then((block) => {
          console.log(block);
        });
    }

    // Get block height, it is a helper method that return the height of the blockchain
    getBlockHeight() {
        // Add your code here
        //return this.chain.length - 1;
        return this.bd.getBlocksCount().then((count) => {
          return count - 1;
        });
    }

    // Add new block
    addBlock(newBlock) {
        // Add your code here
        return this.bd.getBlocksCount()
        .then((count) => {
          return this.getBlock(count - 1);
        })
        .then((block) => {
          newBlock.previousBlockHash = block.hash;
          newBlock.height = block.height + 1;
          newBlock.time = new Date().getTime().toString().slice(0, -3);
          newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
          //console.log('addBlock: ' + JSON.stringify(newBlock))
          return this.bd.addLevelDBData(newBlock.height, JSON.stringify(newBlock));
        });
    }

    // Get Block By Height
    getBlock(height) {
        // Add your code here
        return this.bd.getLevelDBData(height)
        .then((block) => {
          if (block) {
            //console.log('getBlock: ' + block);
            return JSON.parse(block);
          } else
            return undefined;
        });
    }

    // Validate if Block is being tampered by Block Height
    validateBlock(height) {
        // Add your code here
        // get block object
        return this.getBlock(height).then((block) => {
          // get block hash
          let blockHash = block.hash;
          // remove block hash to test block integrity
          block.hash = '';
          // generate block hash
          let validBlockHash = SHA256(JSON.stringify(block)).toString();
          // Compare
          if (blockHash === validBlockHash) {
              return true;
          } else {
            //console.log('Block #'+height+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
            return false;
          }
        });
    }

    // Validate Blockchain
    validateChain() {
        // Add your code here
        let errorLog = [];
        let self = this;
        return this.bd.getBlocksCount().then((count) => {
          for (var i = 0; i < count; i++) {
            // validate block
            errorLog.push(new Promise(function(resolve, reject) {
              var j = i;
              self.validateBlock(j).then((valid) => {
                if (valid === false) {
                  //console.log('validate false', j);
                  resolve('#' + j + ': ' + false);
                } else {
                  resolve('#' + j + ': ' + true);
                }
              });
            }));
          } 

          for (var i = 0; i < count - 1; i++) {
            // compare blocks hash link
            errorLog.push(new Promise(function(resolve, reject) {
              var j = i;
              let blockHash = 0;
              self.getBlock(j)
              .then((block) => {
                blockHash = block.hash;
                return self.getBlock(j+1);
              })
              .then((nextBlock) => {
                let previousHash = nextBlock.previousBlockHash;
                if (blockHash !== previousHash) {
                  //console.log('validate false', j, 'vs', j+1);
                  resolve('#' + j + ' link: ' + false);
                } else {
                  resolve('#' + j + ' link: ' + true);
                }
              });
            }));
          }
          return Promise.all(errorLog);
        });
    }

    // Utility Method to Tamper a Block for Test Validation
    // This method is for testing purpose
    _modifyBlock(height, block) {
        let self = this;
        return new Promise( (resolve, reject) => {
            self.bd.addLevelDBData(height, JSON.stringify(block).toString()).then((blockModified) => {
                resolve(blockModified);
            }).catch((err) => { console.log(err); reject(err)});
        });
    }
   
}

module.exports.Blockchain = Blockchain;
