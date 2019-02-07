<details><summary></summary>

# Project #4. Build a Private Blockchain Notary Service

In this project I created a notary service using my `private blockchain` and `Expressjs`.

## Setup project for Review.

To setup the project for review do the following:
1. Download the project.
2. Run command __npm install__ to install the project dependencies.
3. Run command __node app.js__.

## Testing the project
1. POST http://localhost:8000/requestValidation
The request should contain:
```js
{ "address":"19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL" }
```
2. POST http://localhost:8000/message-signature/validate
The request should contain:
```js
{
"address":"19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
 "signature":"H8K4+1MvyJo9tcr2YN2KejwvX1oqneyCH+fsUL1z1WBdWmswB9bijeFfOfMqK68kQ5RO6ZxhomoXQG3fkLaBl+Q="
}
```
3. POST http://localhost:8000/block
The request should contain:
```js
{
    "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
    "star": {
                "dec": "68° 52' 56.9",
                "ra": "16h 29m 1.0s",
                "story": "Found star using https://www.google.com/sky/"
            }
}
```
4. GET http://localhost:8000/stars/address:[ADDRESS]

5. GET http://localhost:8000/block/[HEIGHT]

</details>
---

# Project #3. Connect Private Blockchain to Front-End Client via APIs

In this project I created the classes to manage my private blockchain using `LevelDB` and serve API for clients using `Expressjs`.

## Setup project for Review.

To setup the project for review do the following:
1. Download the project.
2. Run command __npm install__ to install the project dependencies.
3. Run command __node app.js__.

## Testing the project
1. try GET requesting to http://localhost:8000/block/:blockHeight
2. try POST requesting to http://localhost:8000/block with data like
```js
{
      "body": "Testing block with test string data"
}
```
---
<details><summary></summary>

# Project #2. Private Blockchain

This is Project 2, Private Blockchain, in this project I created the classes to manage my private blockchain, to be able to persist my blochchain I used LevelDB.

## Setup project for Review.

To setup the project for review do the following:
1. Download the project.
2. Run command __npm install__ to install the project dependencies.
3. Run command __node simpleChain.js__ in the root directory.

## Testing the project

The file __simpleChain.js__ in the root directory has all the code to be able to test the project, please review the comments in the file and uncomment the code to be able to test each feature implemented:

* Uncomment the function:
```
(function theLoop (i) {
	setTimeout(function () {
		let blockTest = new Block.Block("Test Block - " + (i + 1));
		myBlockChain.addNewBlock(blockTest).then((result) => {
			console.log(result);
			i++;
			if (i < 10) theLoop(i);
		});
	}, 10000);
  })(0);
```
This function will create 10 test blocks in the chain.
* Uncomment the function
```
myBlockChain.getBlockChain().then((data) => {
	console.log( data );
})
.catch((error) => {
	console.log(error);
})
```
This function print in the console the list of blocks in the blockchain
* Uncomment the function
```
myBlockChain.getBlock(0).then((block) => {
	console.log(JSON.stringify(block));
}).catch((err) => { console.log(err);});

```
This function get from the Blockchain the block requested.
* Uncomment the function
```
myBlockChain.validateBlock(0).then((valid) => {
	console.log(valid);
})
.catch((error) => {
	console.log(error);
})
```
This function validate and show in the console if the block is valid or not, if you want to modify a block to test this function uncomment this code:
```
myBlockChain.getBlock(5).then((block) => {
	let blockAux = block;
	blockAux.body = "Tampered Block";
	myBlockChain._modifyBlock(blockAux.height, blockAux).then((blockModified) => {
		if(blockModified){
			myBlockChain.validateBlock(blockAux.height).then((valid) => {
				console.log(`Block #${blockAux.height}, is valid? = ${valid}`);
			})
			.catch((error) => {
				console.log(error);
			})
		} else {
			console.log("The Block wasn't modified");
		}
	}).catch((err) => { console.log(err);});
}).catch((err) => { console.log(err);});

myBlockChain.getBlock(6).then((block) => {
	let blockAux = block;
	blockAux.previousBlockHash = "jndininuud94j9i3j49dij9ijij39idj9oi";
	myBlockChain._modifyBlock(blockAux.height, blockAux).then((blockModified) => {
		if(blockModified){
			console.log("The Block was modified");
		} else {
			console.log("The Block wasn't modified");
		}
	}).catch((err) => { console.log(err);});
}).catch((err) => { console.log(err);});
```
* Uncomment this function:
```
myBlockChain.validateChain().then((errorLog) => {
	if(errorLog.length > 0){
		console.log("The chain is not valid:");
		errorLog.forEach(error => {
			console.log(error);
		});
	} else {
		console.log("No errors found, The chain is Valid!");
	}
})
.catch((error) => {
	console.log(error);
})
```

This function validates the whole chain and return a list of errors found during the validation.

## What do I learned with this Project

* I was able to identify the basic data model for a Blockchain application.
* I was able to use LevelDB to persist the Blockchain data.
* I was able to write algorithms for basic operations in the Blockchain.
</details>