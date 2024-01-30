const { secp256k1 } = require('ethereum-cryptography/secp256k1');
const { toHex, utf8ToBytes } = require('ethereum-cryptography/utils');
const { keccak256 } = require('ethereum-cryptography/keccak');
const Chance = require('chance');

const chance = new Chance();
const keys = Array.from({ length:5 }, v => {
  const uintPrivKey   = secp256k1.utils.randomPrivateKey();
  const uintPublicKey = secp256k1.getPublicKey(uintPrivKey);
  const uintAddress   = keccak256(uintPublicKey.slice(1)).slice(-20);

  return { privateKey:toHex(uintPrivKey), publicKey:toHex(uintPublicKey), address:toHex(uintAddress) };
});

const accountBalances = keys.reduce((acc, v) => {
  return {
    ...acc,
    [v.address]: { ...v, balance:chance.floating({ fixed:18 })}
  }
}, {});


module.exports = {
  accountBalances,
}
