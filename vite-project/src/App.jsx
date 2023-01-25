import { useState, useRef } from 'react';
import {ethers} from 'ethers';
import axios from 'axios';
import {abi} from './utils';
import {url} from './secret';
import reactLogo from './assets/react.svg';
import './App.css';

let signer;
let provider;
let nft;
let etherscan = 'https://goerli.etherscan.io/tx/';

const contract_address = '0x933F6088681F5DCEB1636c839Ff75F4071D52132';

function App() {
  const [userAddress, setUserAddress] = useState('');
  const [amount, setAmount] = useState(1);
  const [message, setMessage] = useState('');
  const [ethBal, setEthBal] = useState(0);

  function updateAmount(direction) {
    if(userAddress != '') {
      if(direction == 'up' && amount < 10) {
        setAmount(amount + 1);
      } else if (direction == 'down' && amount > 1) {
        setAmount(amount - 1);
      }
    }
  }

  async function init(e) {
    e.preventDefault();

    provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    setUserAddress(await signer.getAddress());
    
    nft = new ethers.Contract(contract_address, abi, provider);
    let state = await nft.state();
    state = parseInt(state);
    if(state == 0) {
      setMessage('Not Minting Yet');
    } else if(state == 1) {
      setMessage('Whitelist Only');
    } else if(state == 2) {
      setMessage('Public Mint');
    }
    //console.log(await signer.getBalance());
    let bal = await signer.getBalance();
    console.log(parseInt(bal._hex));

    setEthBal((parseInt(bal._hex) / 10**18).toFixed(2));
  }

  async function mint(e) {
   
    e.preventDefault();

    let state = await nft.state();
    let proof = await axios.get(`${url}merkle_proof?contract=${contract_address}$wallet=${userAddress}`);
    console.log(proof);
    //console.log(proof.data);

    proof = proof.data.success == false ? [] : proof.data.data;

    let price;
    if(proof == []) {
      if(state < 2) {
        alert('Whitelist only');
        return;
      }
      price = await nft.price();
    } else {
      price = await nft.alPrice();
    }
    console.log(price);
    price = parseInt(price);
    console.log(price);

    try{
      const tx = await nft.connect(signer).mint(amount, proof, {value: (price * amount).toString()});
      document.getElementById('tx').innerHTML = '<a href=' + etherscan + tx.hash + ' target="blank">See Transaction</a>'
    } catch(error) {
      alert(error.message);
    }
  }

  return (
    <div className="App">
      <h1>NFT Mint Page</h1>
      <h2>{message}</h2>
      <div className="card">
        <p>{userAddress != '' ? 'Connected: ' + userAddress : ''}</p>
        <p>{userAddress != '' ? 'Balance: ' + ethBal + ' ETH' : ''}</p>
        <p id='tx'></p>

      <div id="mintDiv">
        <form onSubmit={ userAddress == '' ? e => init(e) : e => mint(e) }>
          <button type="submit">{ userAddress == '' ? 'Connect Wallet' : 'Mint ' + amount}</button>
			  </form>
        <button onClick={() => updateAmount('up')}>^</button>
        <button onClick={() => updateAmount('down')}>v</button>
      </div>

      </div>
    </div>
  )
}

export default App
