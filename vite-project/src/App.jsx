import { useState, useRef } from 'react';
import {ethers} from 'ethers';
import axios from 'axios';
import {abi} from './utils';
import reactLogo from './assets/react.svg';
import './App.css';

let signer;
let provider;
let nft;

const contract_address = '0x1DC556dB9960b37B7959dEd6316E754250309c8B';

function App() {
  const [userAddress, setUserAddress] = useState('');
  const inputRef = useRef(0);
  async function init() {
    provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    setUserAddress(await signer.getAddress());
    
    nft = new ethers.Contract(contract_address, abi, provider);
  }

  async function mint(e) {
   
    e.preventDefault();

    let price = await nft.price();
    const amount = inputRef.current.value;
    console.log(price);
    await nft.connect(signer).mint(amount, [], {value: price});
  }

  return (
    <div className="App">
      <h1>NFT Mint Page</h1>
      <div className="card">
        <p>{userAddress != '' ? 'Connected: ' + userAddress : 'Connect Wallet'}</p>
        <button onClick={() => init()}>{userAddress != '' ? 'Connected' : 'Connect Wallet'}</button>
      <div id="mintDiv">
        <form onSubmit={e => mint(e)}>
				<input
          ref={inputRef}
          id="amount" 
          placeholder="Amount to Mint"
          />
            <button type="submit">Mint</button>
			  </form>
      </div>

      </div>
    </div>
  )
}

export default App
