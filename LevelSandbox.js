/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/

const level = require('level');
const chainDB = './chaindata';

class LevelSandbox {

    constructor() {
      this.db = level(chainDB);
    }

    // Get data from levelDB with key (Promise)
    getLevelDBData(key){
      //Because we are returning a promise, we will need this to be able to reference 'this' inside the Promise constructor
      let self = this; 
      return new Promise(function(resolve, reject) {
        self.db.get(key, (err, value) => {
          if (err) {
            if (err.type == 'NotFoundError') {
              console.log('db.get: ' + key + ' not found');
              resolve(undefined);
            } else {
              console.log('db.get: ' + key + ' get failed', err);
              reject(err);
            }
          } else {
            resolve(value);
          }
        });
      });
    }

    addLevelDBData(key, value) {
      let self = this;
      return new Promise(function(resolve, reject) {
        self.db.put(key, value, function(err) {
          if (err) {
            console.log('db.put: ' + key + ' submission failed', err);
            reject(err);
          } else {
            //console.log('db.put: ' + key + ' ' + value);
            resolve(value);
          }
        });
      });
    }

    getBlocksCount() {
      let self = this;
      return new Promise(function(resolve, reject){
        let i = 0;
        self.db.createReadStream()
          .on('data', function(data) {
            i++;
          })
          .on('error', function(err) {
            console.log('getBlocksCount: Unable to read data stream!', err)
            reject(err);
          })
          .on('close', function() {
            //console.log('getBlocksCount: Block #' + i);
            resolve(i);
          });
        });
    }

    getBlockByHash(hash) {
      let self = this;
      let block = null;
      return new Promise(function(resolve, reject) {
        self.db.createReadStream()
        .on('data', function (data) {
          data = JSON.parse(data.value);
          if(data.hash === hash){
            block = data;
          }
        })
        .on('error', function (err) {
          reject(err)
        })
        .on('close', function () {
          resolve(block);
        });
      });
    }

    getBlockByWalletAddress(address) {
      let self = this;
      let blocks = [];
      return new Promise(function(resolve, reject) {
        self.db.createReadStream()
        .on('data', function (data) {
          data = JSON.parse(data.value);
          try { // when no body
            if(data.body.address === address){
              blocks.push(data);
            }
          } catch {
          }
        })
        .on('error', function (err) {
          reject(err)
        })
        .on('close', function () {
          resolve(blocks);
        });
      });
    }
        
}

/* ===== Testing ==============================================================|
|  - Self-invoking function to add blocks to chain                             |
|  - Learn more:                                                               |
|   https://scottiestech.info/2014/07/01/javascript-fun-looping-with-a-delay/  |
|                                                                              |
|  * 100 Milliseconds loop = 36,000 blocks per hour                            |
|     (13.89 hours for 500,000 blocks)                                         |
|    Bitcoin blockchain adds 8640 blocks per day                               |
|     ( new block every 10 minutes )                                           |

// Add data to levelDB with value
function addDataToLevelDB(value) {
    let i = 0;
    this.db.createReadStream().on('data', function(data) {
          i++;
        }).on('error', function(err) {
            return console.log('Unable to read data stream!', err)
        }).on('close', function() {
          console.log('Block #' + i);
          addLevelDBData(i, value);
        });
}


(function theLoop (i) {
  setTimeout(function () {
    addDataToLevelDB('Testing data');
    if (--i) theLoop(i);
  }, 100);
})(10);
|  ===========================================================================*/

module.exports.LevelSandbox = LevelSandbox;
