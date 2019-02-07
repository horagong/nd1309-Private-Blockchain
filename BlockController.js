const SHA256 = require('crypto-js/sha256');
const Block = require('./Block.js');
const BlockChain = require('./BlockChain.js');
const MemPool = require('./MemPool.js');
const hex2ascii = require('hex2ascii');

//const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');


/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {

    /**
     * Constructor to create a new BlockController, you need to initialize here all your endpoints
     * @param {*} app 
     */
    constructor(app) {
        this.app = app;

        //this.blocks = [];
        //this.initializeMockData();
        this.bc = new BlockChain.Blockchain();
        this.mempool = new MemPool.MemPool();

        this.getBlockByHeight();
        this.getBlockByHash();
        this.getBlockByWalletAddress();
        this.postNewBlock();
        this.requestValidation();
        this.validate();
    }

    getBlockByHeight() {
      this.app.get("/block/:height", async (req, res) => {
        let height = req.params.height;
        let block = await this.bc.getBlock(height)
        if (block) {
          try {
            block.body.star.storyDecoded = hex2ascii(block.body.star.story);
          } catch {
          }
          res.send(JSON.stringify(block, null, 2));
        } else {
          res.status(400).json({message: "no such block"});
        }
      });
    }

    getBlockByHash() {
      this.app.get("/stars/hash([\:]):hash", async (req, res) => {
        let hash = req.params.hash;
        let block = await this.bc.getBlockByHash(hash)
        if (block) {
          try {
            block.body.star.storyDecoded = hex2ascii(block.body.star.story);
          } catch {
          }
          res.send(JSON.stringify(block, null, 2));
        } else {
          res.status(400).json({message: "no such block"});
        }
      });
    }

    
    getBlockByWalletAddress() {
      this.app.get("/stars/address([\:]):address", async (req, res) => {
        let address = req.params.address;
        let blocks = await this.bc.getBlockByWalletAddress(address)
        if (blocks) {
          blocks.forEach((item) => {
            try {
              item.body.star.storyDecoded = hex2ascii(item.body.star.story);
            } catch {
            }
          });
          res.send(JSON.stringify(blocks, null, 2));
        } else {
          res.status(400).json({message: "no such block"});
        }
      });
    }
    

    postNewBlock() {
      this.app.post("/block", async (req, res) => {
        if (req.body.address) {
          const valid = await this.mempool.verifyAddressRequest(req.body.address);
          if (valid) {
            let body = {
              address: req.body.address,
              star: {
                      ra: req.body.star.ra,
                      dec: req.body.star.dec,
                      mag: req.body.star.mag,
                      cen: req.body.star.cen,
                      story: Buffer.from(req.body.star.story).toString('hex')
              }
            };
            let block = new Block.Block(body);
            block = await this.bc.addBlock(block);
            block.body.star.storyDecoded = hex2ascii(block.body.star.story);
            res.send(JSON.stringify(block.body, null, 2));
          } else {
            res.status(400).json({message: "not accessible"});
          }
        } else {
          res.status(400).json({message: "no block content"});
        }
      });
    }


    requestValidation() {
      this.app.post("/requestValidation", async (req, res) => {
        if (req.body.address) {
          // add address and requestTimeStamp to mempool
          // so you can calculate later the window time
          const address = req.body.address;
          const requsetObject = this.mempool.addRequestValidation(address);

          //return with requestObject
          res.send(JSON.stringify(requsetObject, null, 2));
        } else {
          res.status(400).json({message: "no address"});
        }
      });
    }

    validate() {
      this.app.post("/message-signature/validate", async (req, res) => {
        if (req.body.address && req.body.signature) {
          const validateRequest = await this.mempool.validateRequestByWallet(req.body.address, req.body.signature);
          if (validateRequest) {
            res.send(JSON.stringify(validateRequest, null, 2));
          } else {
            res.status(400).json({message: "invalid"});
          }
        } else {
          res.status(400).json({message: "no such address"});
        }
      });
    }

    /**
     * Help method to inizialized Mock dataset, adds 10 test blocks to the blocks array
    initializeMockData() {
        if(this.blocks.length === 0){
            for (let index = 0; index < 10; index++) {
                let blockAux = new BlockClass.Block(`Test Data #${index}`);
                blockAux.height = index;
                blockAux.hash = SHA256(JSON.stringify(blockAux)).toString();
                this.blocks.push(blockAux);
            }
        }
    }
     */

}


/**
 * Exporting the BlockController class
 * @param {*} app 
 */
module.exports = (app) => { return new BlockController(app);}
