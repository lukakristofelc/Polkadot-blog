import './App.css';
import * as metadata from "./metadata.json"
import { useState, useEffect } from 'react';
import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp';
import { WsProvider, ApiPromise } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract'
import { ModeratorAddress, ContractAddress, GasLimit, CurrentAccount } from './config.js'
import SwitcherComponent from './Components/SwitcherComponent/SwitcherComponent';

function App() {
  const [dataList, setDataList] = useState([]);
  const [input, setInput] = useState('');
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState([]);
  const [injector, setInjector] = useState([]);
  const [currentUser, setCurrentUser] = useState('');
  const [isMod, setIsMod] = useState(false);
  const [showTextarea, setShowTextArea] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [username, setUsername] = useState('');

  const orderPosts = (accounts) => {
    console.log(accounts.slice());
    return accounts.slice().sort((a, b) => b['timestamp'] - a['timestamp'])
  }

  const connectExtension = async() => {    
    await web3Enable('Polkadot Blogchain');
    const allAccounts = await web3Accounts();
    const selectedAccount = allAccounts.filter(account => account['address'] === CurrentAccount);
    setAccount(selectedAccount[0]);
    await connectContract();
  }

  const connectContract = async () => {
    const ws = new WsProvider("ws://localhost:9944");
    const api = await ApiPromise.create({ provider: ws });
    const contract = new ContractPromise(api, metadata, ContractAddress);
    const injector = await web3FromSource(account.meta.source);
    
    setContract(contract);
    setInjector(injector);
  }

  const createUser = async () => {
    if(!newUsername) return;

    let user = [];
    let isMod = JSON.stringify(ModeratorAddress) === JSON.stringify(account.address);
    await contract.tx.createUser({ GasLimit }, newUsername, isMod).signAndSend(account.address, { signer: injector.signer });
    
    while (user.length != 1)
    {
      const {output} = await contract.query.getUsers(account.address, { GasLimit });
      user = output.filter(user => JSON.stringify(user['userAddress']) === JSON.stringify(account.address));
    }

    setCurrentUser(user[0]);
    setUsername(user[0]['username']);
    setIsMod(user[0]['isMod']);
    setNewUsername('');
    setShowTextArea(false);
  }

  const doesUserExist = async () => {
    const {output} = await contract.query.getUsers(account.address, { GasLimit });
    const user = output.filter(user => JSON.stringify(user['userAddress']) === JSON.stringify(account.address));

    if (user.length === 1)
    {
      setCurrentUser(user[0]);
      setUsername(user[0]['username']);
      setIsMod(user[0]['isMod']);
      setShowTextArea(false);
    }
    else if (user.length > 1)
    {
      throw new Error("More than one user with this address found.")
    }
    else
    {
      setShowTextArea(true);
    }
  }

  useEffect(() => {
    connectContract();
  }, [account]);
  
  useEffect(() => {
    doesUserExist();
  });

  if (currentUser === '')
  {
    return (<div>
              <div className='header'>
                <h1>POLKADOT BLOGCHAIN</h1>
              </div>
              <div>
                { showTextarea ? <div className='sign-up-panel'>
                                    <p style={{textAlign: 'center'}}>Please pick a username:</p> <br />
                                    <textarea
                                      id='username' 
                                      type="text"
                                      placeholder="Username"
                                      onChange={e => setNewUsername(e.target.value)}
                                      rows="8" cols="50"
                                    /> 
                                    <button onClick={createUser}>SIGN UP</button> 
                                  </div> : 
                                  <div>
                                    <p style={{textAlign: 'center'}}>Please connect your Phantom Wallet to continue:</p>
                                    <div style={{ display: 'flex', justifyContent: 'center', marginTop:'20px' }}>
                                    <button onClick={connectExtension}>CONNECT EXTENSION</button>
                                    </div>
                                  </div>}
              </div>
            </div>)
  }
  else
  {
    return (
      <div>
        <SwitcherComponent key={currentUser} currentUser={currentUser} isMod={isMod} contract={contract} gasLimit={GasLimit} account={account} injector={injector}/>
      </div>
    )
  }
}

export default App;
