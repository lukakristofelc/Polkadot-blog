import logo from './logo.svg';
import './App.css';
import * as metadata from "./metadata.json"
import { useState, useEffect } from 'react';
import { Objava } from './Components/ObjavaComponent/ObjavaComponent'
import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp';

const { WsProvider, ApiPromise } = require('@polkadot/api');
const { ContractPromise } = require('@polkadot/api-contract');

function App() {
  const wsUrl = 'ws://localhost:9944';
  const contractAddress = '5FhtYdiyMp7qWLUjENfFkysAnVJRjr8yNMJyPb5EQzzdxp25';

  const [dataList, setDataList] = useState([]);
  const [input, setInput] = useState('');
  const [account, setAccount] = useState('');

  let gasLimit = 74999922688;

  const orderPosts = (accounts) => {
    console.log(accounts.slice());
    return accounts.slice().sort((a, b) => b['timestamp'] - a['timestamp'])
  }

  async function connectExtention() {    
    const extensions = await web3Enable('Polkadot Blogchain');
    const allAccounts = await web3Accounts();
    setAccount(allAccounts[0]);
  }

  async function update() {
    if (!input) return

    let ws = new WsProvider(wsUrl);
    let wsApi = await ApiPromise.create({ provider: ws });
    let contract = new ContractPromise(wsApi, metadata, contractAddress);
    
    const injector = await web3FromSource(account.meta.source);

    await contract.tx['add']({ gasLimit }, input ).signAndSend(account.address, { signer: injector.signer }, ({ status }) => {
      if (status.isInBlock) {
          console.log(`Completed at block hash #${status.asInBlock.toString()}`);
      } else {
          console.log(`Current status: ${status.type}`);
      }
    }).catch((error) => {
        console.log(':( transaction failed', error);
    });

    setInput('');    
    setTimeout(getPosts(), 1000);
  }

  async function getPosts() {
    let ws = new WsProvider(wsUrl);
    let wsApi = await ApiPromise.create({ provider: ws });
    let contract = new ContractPromise(wsApi, metadata, contractAddress);

    let { result, output } = await contract.query['get'](account.address, { gasLimit });
    setDataList(orderPosts(output));
    
  }


  useEffect(()=>{
    getPosts();
  }, [])


  console.log(dataList[0]['timestamp'].toLocaleString());

  if (account == '') 
  {
    return (
      <div>
        <h1 style={{textAlign: 'center'}}>POLKADOT BLOGCHAIN</h1>
        <p style={{textAlign: 'center'}}>Please connect the Polkadot.js browser extension to continue:</p>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop:'20px' }}>
          <button onClick={connectExtention}>CONNECT POLKADOT.js EXTENSION</button>
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
                <button onClick={update}>OBJAVI</button>
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
