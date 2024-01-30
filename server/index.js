const express = require("express");
const app = express();
const cors = require("cors");
const { secp256k1 } = require('ethereum-cryptography/secp256k1');
const { utf8ToBytes } = require('ethereum-cryptography/utils');

const { accountBalances, wallets } = require('./generate-keys');

const port = 3042;

app.use(cors());
app.use(express.json());

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const account = accountBalances[address];

  if(!account || isNaN(account.balance)) {
    res.status(404).send({ message:'User not found or is mising balance.' })
  }

  res.send({ balance:account.balance });
});

app.post("/send", (req, res) => {
  const { signature, msgHash, trxDetails } = req.body;
  const { senderAddr, recipientAddr, amount } = trxDetails;
  const senderAcc = accountBalances[senderAddr];
  const recipientAcc = accountBalances[recipientAddr];
  console.log(senderAcc)

  // verify sender
  if(senderAcc.address !== senderAddr) {
    res.status(400).send({ message:'Invalid sender address' });
  }

  // verify signed transaction
  if(!secp256k1.verify(signature, msgHash, utf8ToBytes(senderAcc.publicKey))) {
    res.status(400).send({ message:'Transaction signature failed.' });
  }

  if (senderAcc.balance < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    senderAcc.balance   -= amount;
    recipientAcc.balance += amount;

    res.send({ balance:senderAcc.balance });
  }
});

app.get('/recipients', (req, res) => {
  const addresses = Object.keys(accountBalances).slice(1,);
  res.send({ addresses });
});

app.get('/senderPKey', (req, res) => {
  const senderPkey = accountBalances[Object.keys(accountBalances)[0]].privateKey;
  res.send({ senderPkey });
})

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
  console.log('Primary Address: ', accountBalances[Object.keys(accountBalances)[0]]);
});
