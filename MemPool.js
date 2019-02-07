const bitcoinMessage = require('bitcoinjs-message');
//The mempool component will store temporal validation requests for 5 minutes (300 seconds).
const TimeoutRequestsWindowTime = 5*60*1000;
//The mempool component will store temporal valid requests for 30 minutes (1800 seconds).
const TimeoutValidRequestsWindowTime = 30*60*1000;

class MemPool {
  constructor() {
    this.mempool = {};
    this.timeoutRequests = {};
    this.mempoolValid = {};
  }

  addRequestValidation(address) {
    let requestObject = this.mempool[address];
    if (requestObject) {
      //If the user re-submits a request, the application will not add a new request; 
      //instead, it will return the same request that it is already in the mempool.
      const timeElapse = (new Date().getTime().toString().slice(0,-3)) - requestObject.requestTimeStamp;
      const timeLeft = (TimeoutRequestsWindowTime/1000) - timeElapse;
      requestObject.validationWindow = timeLeft;
      console.log('already in mempool: ', JSON.stringify(requestObject));

    } else {
      const requestTimeStamp = new Date().getTime().toString().slice(0,-3);
      const timeElapse = (new Date().getTime().toString().slice(0,-3)) - requestTimeStamp;
      const timeLeft = (TimeoutRequestsWindowTime/1000) - timeElapse;

      requestObject = {
        walletAddress: address,
        requestTimeStamp: requestTimeStamp,
        message: address + ':' + requestTimeStamp + ':starRegistry',
        validationWindow: timeLeft
      };
      this.mempool[address] = requestObject;

      //The request should be available for validation for 5 minutes. 
      //If the condition is met, we will need to delete the request.
      const self = this;
      this.timeoutRequests[address] = setTimeout(function() { 
        delete self.mempool[address];
        delete self.timeoutRequests[address];
        console.log('timeout: ', address, self.mempool, self.timeoutRequests);
      }, TimeoutRequestsWindowTime);
    }

    return requestObject;
  }

  //Verify if the request validation exists and if it is valid.
  verifyAddressRequest(address) {
    if (this.mempool[address]) {
      if (this.mempoolValid[address]) {
        delete this.mempoolValid[address];
        delete this.mempool[address];
        delete this.timeoutRequests[address];
        return true;
      }
    }
    return false;
  }

  validateRequestByWallet(address, signature) {
    const requestObject = this.mempool[address];
    if (requestObject) {
      const timeElapse = new Date().getTime().toString().slice(0,-3) - requestObject.requestTimeStamp;
      if (timeElapse < TimeoutRequestsWindowTime/1000) {
        const isValid = bitcoinMessage.verify(requestObject.message, address, signature);
        if (isValid) {
          const validRequest = {
            registerStar: true,
            status : {
               address: requestObject.walletAddress,
               requestTimeStamp: requestObject.requestTimeStamp,
               message: requestObject.message,
               validationWindow: requestObject.validationWindow,
               messageSignature: true
            }
          };

          //make sure you clean it up before returning the object.
          clearTimeout(this.timeoutRequests[address]);

          this.mempoolValid[address] = validRequest;
          setTimeout(function() { 
            delete self.mempoolValid[address];
            console.log('valid requests timeout: ', address);
          }, TimeoutValidRequestsWindowTime);
          return validRequest;
        }
      }
    }
  }



}
module.exports.MemPool = MemPool;
