import { useEffect, useState } from 'react';
import './ChatListComponent.css';
import ChatComponent from '../ChatComponent/ChatComponent';

export default function ChatListComponent(props) {

    let currentUser = props.currentUser;
    let contract = props.contract;
    let gasLimit = props.gasLimit;
    let account = props.account;
    let injector = props.injector;
    
    const [friends, setFriends] = useState([]);
    const [currentChatAddress, setCurrentChatAddress] = useState('');
    const [name, setName] = useState('');
          
    const getFriendsData = async () => {
        try {
            const {output} = await contract.query.getUsers(account.address, { gasLimit });
            const user = output.filter(user => JSON.stringify(user['userAddress']) === JSON.stringify(currentUser['userAddress']));
            setFriends(user[0]['friends']);
        } catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        getFriendsData();
    }, [])

    if (friends.length == 0)
    {
        return(
            <div className='chat-selection'>
                <div className='chat-list'>
                    <h2>You need friends in order to message them.</h2>
                </div>
            </div>
        );
    }
    else
    {
        return(
        <div className='chat-selection'>
            <div className='chat-list'>
                <h2>SELECT A FRIEND</h2>
                {friends.map(friend => <button key={friend['userAddress']} onClick={() => setCurrentChatAddress({currentChatAddress: friend['userAddress'], name: friend['username']})}>{friend['username']}</button>)}
            </div>
            {currentChatAddress != "" ? 
                <ChatComponent
                    setProfileView={props.setProfileView}
                    currentUser={currentUser}
                    key={currentChatAddress} 
                    contract={contract} 
                    currentChatter={currentChatAddress}
                    closeChat={() => setCurrentChatAddress('')}
                    gasLimit={gasLimit} 
                    account={account} 
                    injector={injector}
                /> : <div />}
        </div>
        )
    }
}