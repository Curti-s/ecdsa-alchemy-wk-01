import { useState, useEffect } from "react";
import server from "./server";
import { keccak256 } from 'ethereum-cryptography/keccak';
import { utf8ToBytes } from  'ethereum-cryptography/utils';
import { secp256k1 } from  'ethereum-cryptography/secp256k1';

function Transfer({ address, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [recipientAddress, setRecipientAddress] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);
  

  useEffect(() => {
    const fetchRecipients = async () => {
      return await server.get('/recipients');
    }
    fetchRecipients()
      .then(res => setAddresses(res.data.addresses));
  }, []);

  async function transfer(evt) {
    evt.preventDefault();
    // TODO
    // hash message
    // get private / public key of the sender
    // sign transaction using Private key

    const sender = address;
    const amount = parseInt(sendAmount, 10);
    const trxDetails = {
      senderAddr: sender,
      amount,
      recipientAddr: recipientAddress,
    };
    const { data:{ senderPkey } } = await server.get('/senderPKey');
    let msgHash, signature;
    try {
      msgHash = keccak256(utf8ToBytes(JSON.stringify(trxDetails)));
      signature = secp256k1.sign(msgHash, senderPkey);
    } catch(err) {
      alert(err);
    }

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        signature,
        msgHash,
        trxDetails,
      });
      setBalance(balance);
    } catch (ex) {
      // alert(ex?.response?.data?.message);
    }
  }

  const onRecipientSelect = e => {
    setRecipientAddress(e.target.value);
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
          required
        ></input>
      </label>

      <label>
        Choose Recipent
        <select name="recipients" value={recipientAddress} onChange={onRecipientSelect} required>
          <option></option>
          {!!addresses && addresses.length &&  addresses.map((address, idx) => 
            <option key={`${idx}-addr-${address}`} value={address}>{address}</option>
          )}
        </select>
      </label>
      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
