import './App.css';
import * as metadata from "./metadata.json"
import { useState, useEffect } from 'react';
import { Objava } from './Components/ObjavaComponent/ObjavaComponent'
import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp';

const { WsProvider, ApiPromise } = require('@polkadot/api');
const { ContractPromise } = require('@polkadot/api-contract');

function App() {
  const contractAddress = '5D217sKE1MMr87TCxBeLA5xa6ZnVPVWbxhSXPxNVmTSPwBDw';

  const [dataList, setDataList] = useState([]);
  const [input, setInput] = useState('');
  const [account, setAccount] = useState('');

  let gasLimit = -1;

  const orderPosts = (accounts) => {
    console.log(accounts.slice());
    return accounts.slice().sort((a, b) => b['timestamp'] - a['timestamp'])
  }

  async function connectExtension() {    
    await web3Enable('Polkadot Blogchain');
    const allAccounts = await web3Accounts();
    setAccount(allAccounts[0]);
  }

  async function connectContract() {
    let ws = new WsProvider("ws://localhost:9944");
    let api = await ApiPromise.create({ provider: ws });
    let contract = new ContractPromise(api, metadata, contractAddress);

    return contract;
  }

  

  async function updatePosts() {
    if (!input) return

    const contract = await connectContract();
    const injector = await web3FromSource(account.meta.source);

    await contract.tx.add({ gasLimit }, input ).signAndSend(account.address, { signer: injector.signer });

    setInput('');
    getPosts();
  }

  async function getPosts() {
    const contract = await connectContract();
    let { output } = await contract.query.get(account.address, { gasLimit });
    setDataList(orderPosts(output));
  }

  useEffect(()=>{
    getPosts();
  }, [])

  if (account == '') 
  {
    return (
      <div>
        <h1 style={{textAlign: 'center'}}>POLKADOT BLOGCHAIN</h1>
        <p style={{textAlign: 'center'}}>Please connect the Polkadot.js browser extension to continue:</p>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop:'20px' }}>
          <button onClick={connectExtension}>CONNECT POLKADOT.js EXTENSION</button>
        </div>
      </div>
    )
  } 
  else 
  {
    return (
      <div className="App">
        <div>
          {
            (
              <div className='nova-objava'>
                <h1>POLKADOT BLOGCHAIN</h1>
                <textarea 
                  type="text"
                  placeholder="Vnesi novo objavo"
                  onChange={e => setInput(e.target.value)}
                  value={input}
                  rows="8" cols="50"
                />
                <br/>
                <button onClick={updatePosts}>OBJAVI</button>
              </div>
            )
          }
          {
            dataList.map(objava => 
            <Objava avtor={objava['avtor'].toString()} 
                    vsebina={objava['vsebina']} 
                    timestamp={new Date(parseInt(objava['timestamp'].toString())).toLocaleString()} />)
          }
        </div>
      </div>
    );
  }
}

export default App;
