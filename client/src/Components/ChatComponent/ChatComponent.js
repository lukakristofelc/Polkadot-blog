import { useState, useEffect } from 'react';
import './ChatComponent.css';

export default function ChatComponent(props) {
    
    let contract = props.contract;
    let closeChat = props.closeChat;
    let currentUser = props.currentUser;
    let name = props.name;
    let currentChatter = props.currentChatter;
    let gasLimit = props.gasLimit;
    let account = props.account;
    let injector = props.injector;

    const [chat, setChat] = useState([]);
    const [chatAccount, setChatAccount] = useState([]);
    const [input, setInput] = useState('');

    const [currentUsername, setCurrentUsername] = useState('');
    const [chatterUsername, setChatterUsername] = useState('');

    const sendMessage = async () => {
        if(input == "") {
            alert("Cannot send empty message");
            return;
        }

        let user1 = currentChatter.currentChatAddress;
        let user2 = currentUser['userAddress'];
        
        console.log(currentChatter);
        console.log(currentUser);

        if (user2 < user1)
        {
            let swap = user1;
            user1 = user2;
            user2 = swap;
        }

        await contract.tx.sendMessage({ gasLimit }, user1, user2, input).signAndSend(account.address, { signer: injector.signer });
        setInput('');
    }

    const getMessages = async () => {
        let messages = [];

        let user1 = currentChatter.currentChatAddress;
        let user2 = currentUser['userAddress'];
        
        if (user2 < user1)
        {
            let swap = user1;
            user1 = user2;
            user2 = swap;
        }

        const {output} = await contract.query.getChat(account.address, { gasLimit }, user1, user2);
        messages = output;
        
        let reversedChat = [... messages].reverse();
        setChat(reversedChat);
    }

    const getUsername = (from) => {
        if (JSON.stringify(currentUser['userAddress']) === JSON.stringify(from))
        {
            return currentUsername;
        }
        else
        {
            return chatterUsername;
        }
    }

    useEffect(() => {
        getMessages();
    });

    useEffect(() => {
       setCurrentUsername(currentUser['username']);
       setChatterUsername(currentChatter.name);
    }, []);

    return(
        <div className='composer'>
            <div className="close-button">
                <button onClick={() => props.setProfileView(currentChatter.currentChatAddress, currentChatter.name)}>VISIT PROFILE</button>
                <button onClick={closeChat}>CLOSE CHAT</button>
            </div>
            <div className="message-composer">
                <div className="messages">
                    {chat.map(message => <p key={message['timestamp']}><span id='sender_name'>{getUsername(message['from'])+": "}</span><br/>{message['content']}</p>)}
                </div>  
                <textarea 
                        type="text"
                        id='message_input'
                        placeholder="Insert new message"
                        onChange={e => setInput(e.target.value)}
                        value={input}
                        rows="8" cols="50"
                    />
                <button id='message_send' onClick={sendMessage}>SEND</button>
            </div>
        </div>
    )
    
}