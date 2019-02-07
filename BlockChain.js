/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

const SHA256 = require('crypto-js/sha256');
const LevelSandbox = require('./LevelSandbox.js');
const Block = require('./Block.js');

class Blockchain {

    constructor() {
        this.bd = new LevelSandbox.LevelSandbox();
    }

    // Helper method to create a Genesis Block (always with height= 0)
    // You have to options, because the method will always execute when you create your blockchain
    // you will need to set this up statically or instead you can verify if the height !== 0 then you
    // will not create the genesis block
    async generateGenesisBlock() {
        // Add your code here
        let block = new Block.Block("Genesis block");
        block.time = new Date().getTime().toString().slice(0, -3);
        block.hash = SHA256(JSON.stringify(block)).toString();
        console.log('genesis block: ', JSON.stringify(block));
        block = await this.bd.addLevelDBData(0, JSON.stringify(block));
        return JSON.parse(block);
    }

    // Get block height, it is a helper method that return the height of the blockchain
    async getBlockHeight() {
        // Add your code here
        let count = await this.bd.getBlocksCount();
        return count - 1;
    }

    // Add new block
    async addBlock(newBlock) {
        let block;
        let count = await this.bd.getBlocksCount();
        if (count > 0) {
          block = await this.getBlock(count - 1);
        } else {
          block = await this.generateGenesisBlock();
        }

        newBlock.previousBlockHash = block.hash;
        newBlock.height = block.height + 1;
        newBlock.time = new Date().getTime().toString().slice(0, -3);
        newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
        //console.log('addBlock: ' + JSON.stringify(newBlock))
        block = await this.bd.addLevelDBData(newBlock.height, JSON.stringify(newBlock));
        return JSON.parse(block);
    }

    async getBlock(height) {
        let block = await this.bd.getLevelDBData(height);
        if (block) {
          //console.log('getBlock: ' + block);
          return JSON.parse(block);
        } else {
          return undefined;
        }
    }

    async getBlockByHash(hash) {
      let block = await this.bd.getBlockByHash(hash);
      return block;
    }

    async getBlockByWalletAddress(address) {
      let blocks = await this.bd.getBlockByWalletAddress(address);
      return blocks;
    }


    // Validate if Block is being tampered by Block Height
    async validateBlock(height) {
        // Add your code here
        // get block object
        let block = await this.getBlock(height);
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
    }

    // Validate Blockchain
    async validateChain() {
        // Add your code here
        const errorLog = [];
        const self = this;
        const count = await this.bd.getBlocksCount();
        /*
        for (let i = 0; i < count; i++) {
          errorLog.push(new Promise(async function(resolve, reject) {
            const j = i;
            const valid = await self.validateBlock(i);
            if (valid === false) {
              //console.log('validate false', j);
              resolve('#' + j + ': ' + false);
            } else {
              resolve('#' + j + ': ' + true);
            }
          }));
        }
        */

        for (let i = 0; i < count - 1; i++) {
          // compare blocks hash link
          errorLog.push(new Promise(async function(resolve, reject) {
            const j = i;
            const block = await self.getBlock(j);
            const blockHash = block.hash;
            const nextBlock = await self.getBlock(j+1);
            const previousHash = nextBlock.previousBlockHash;
            if (blockHash !== previousHash) {
              //console.log('validate false', j, 'vs', j+1);
              resolve('#' + j + ' link: ' + false);
            } else {
              resolve('#' + j + ' link: ' + true);
            }
          }));
        }
        return Promise.all(errorLog);
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
