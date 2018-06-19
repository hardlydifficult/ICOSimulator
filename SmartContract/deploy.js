const Nebulas = require('nebulas');
const fs = require('fs');
const consts = require('../static/consts');
let conf = null;

try{
  conf = require('./config.json');
}catch (e) {
  console.log('failed to load config.json. Try to run "yarn run generateconfig" first.');
  process.exit(1);
}

if(conf.version !==  consts.CONF_VERSION){
  console.log('config outdated.');
  process.exit(1);
}

const contractSource = fs.readFileSync('./contract.js').toString();
const apiUrl = "https://testnet.nebulas.io";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

var options;
var receipt;
let neb = new Nebulas.Neb();

async function run(){
  let account = new Nebulas.Account();
  account.setPrivateKey(conf.account.privateKey);

  neb.setRequest(new Nebulas.HttpRequest(apiUrl));
  let nebState = await neb.api.getNebState();
  let accountState = await neb.api.getAccountState(account.getAddressString());

  options = {
    from : account,
    to : account.getAddressString(),
    nonce : parseInt(accountState.nonce) + 1,
    gasPrice: 1000000,
    gasLimit: 2000000,
    contract : {
      source : contractSource,
      sourceType : 'js',
      args : '[0]',
      function : 'save'
    },
    chainID : nebState.chain_id
  };

  let transaction = new Nebulas.Transaction(options);
  transaction.signTransaction();

  let payload = {
    data : transaction.toProtoString()
  };
  let response = await neb.api.sendRawTransaction(payload);
  console.log(response);

  let attempt = 0;
  while(1===1){
    receipt = await neb.api.getTransactionReceipt({hash:response.txhash});

    if(receipt.status === 0){
      console.log('Deploy failed');
      console.log(receipt);
      process.exit(1);
    }else if(receipt.status === 1){
      console.log(`Transaction no longer pending. Receipt:`);
      console.log(receipt);

      if(receipt.contract_address && receipt.contract_address.length > 0){
        let toSource = require('tosource');
        //write to the config file
        let content = "/*AUTOGENERATED BY DEPLOY SCRIPT. DO NOT EDIT*/\n";
        let obj = {
          apiUrl : apiUrl,
          contract : receipt.contract_address
        };
        content += "neb_contract=" + toSource(obj) + ";";
        fs.writeFileSync('../static/settings.js', content);
        
        await callMethod("setStartingResources", '[42]'); 
        await callMethod("setWorldResources", '[555555555]'); 
        await callMethod("setBuyPrice", '[10000000]'); 

        var items = [
          // Raw production
          {name: "Make a Commit on Github", sort_id: 0, start_price: 1, resources_per_s: 1},
          {name: "Announce an Announcement", sort_id: 1, start_price: 30, resources_per_s: 5},
          {name: "Publish Performance Numbers", sort_id: 2, start_price: 500, resources_per_s: 10},
          {name: "Do a Giveaway on Twitter", sort_id: 3, start_price: 15000, resources_per_s: 25},
          {name: "Incite FOMO", sort_id: 4, start_price: 420000, resources_per_s: 50},
          {name: "Buy Exchange Listing", sort_id: 5, start_price: 20000000, resources_per_s: 100},
          {name: "Air Drop", sort_id: 6, start_price: 3000000000, resources_per_s: 500},
          {name: "Announce Partnership", sort_id: 7, start_price: 2000000000000, resources_per_s: 10000},

          // Bonuses
          {name: "Tom Lee", sort_id: 8, start_price: 500000, bonus_multiplier: 1},
          {name: "Craig Grant", sort_id: 9, start_price: 35000000, bonus_multiplier: 5},
          {name: "Ian Balina", sort_id: 10, start_price: 1000000000, bonus_multiplier: 20},
          {name: "Suppoman", sort_id: 11, start_price: 1000000000, bonus_multiplier: 20},
          {name: "Trevon James", sort_id: 12, start_price: 1000000000, bonus_multiplier: 20},
          {name: "Roger Ver", sort_id: 13, start_price: 1000000000, bonus_multiplier: 20},
          {name: "John McAfee", sort_id: 14, start_price: 1000000000, bonus_multiplier: 20},
          {name: "Carlos Matos", sort_id: 15, start_price: 1000000000, bonus_multiplier: 20},
        ]

        for(var i = 0; i < items.length; i++)
        {
          await callMethod("createItem", '[' + JSON.stringify(items[i]) + ']'); 
        }

        // for(var i = 0; i < items.length; i++)
        // {
        //   nebWrite("createItem", [items[i]]); 
        //   sleep(5000);
        // }

        await callMethod("changeOwner", '["n1S5JNP13pnoyswKbGtrtE3Bexz6pbtKaPj"]');
      }

      return;
    }else if(receipt.status === 2){
      attempt++;
      console.log(`Transaction pending... attempt: ${attempt} - ${new Date()}`);
      if(attempt === 1)
        console.log(receipt);
      await sleep(3000);
    }
  }
}

run();

async function callMethod(method, args)
{
  options.to = receipt.contract_address;
  options.contract = {
    function: method,
    args
  };
  options.nonce++;
  var transaction = new Nebulas.Transaction(options);
  transaction.signTransaction();

  let payload = {
    data : transaction.toProtoString()
  };
  let response = await neb.api.sendRawTransaction(payload);
  console.log(response);
}