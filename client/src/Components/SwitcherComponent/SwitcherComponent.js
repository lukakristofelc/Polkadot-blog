import { useState, useEffect } from 'react';
import './SwitcherComponent.css';
import FeedComponent from '../FeedComponent/FeedComponent';
import ChatListComponent from '../ChatListComponent/ChatListComponent';
import MyProfileComponent from '../MyProfileComponent/MyProfileComponent';
import ForeignProfileComponent from '../ForeignProfileComponent/ForeignProfileComponent';

export default function SwitcherComponent(props) {
    
    let currentUser = props.currentUser;
    let isMod = props.isMod;
    let contract = props.contract;
    let username = props.username;
    let gasLimit = props.gasLimit;
    let account = props.account;
    let injector = props.injector;

    const [view, setView] = useState('F');
    const [profileData, setProfileData] = useState({});
    const [numOfFriendRequests, setNumOfFriendRequests] = useState();

    const setFeedView = () => {
        setView('F');
    }

    const setMessageView = () => {
        setView('M');
    }

    const setMyProfileView = () => {
        setView('P');
    }

    const setProfileView = (foreignAddress, username) => {
        console.log(foreignAddress);
        console.log(username);
        if (JSON.stringify(foreignAddress) === JSON.stringify(currentUser['userAddress']))
        {
            setMyProfileView();
            return;
        }

        const profileData = {
            foreignAddress: foreignAddress,
            username: username
        }

        setView('FP');
        setProfileData(profileData);
    }
/*
    useEffect(() => {
        const getFriendRequests = async() => {
            try {
                const requests = [];

                const [friendsAddress] = await PublicKey.findProgramAddress(
                    [
                        anchor.utils.bytes.utf8.encode('friends'),
                        currentUser.toBuffer(),
                    ],
                    contract.programId
                )

                const friendsData = await contract.account.friends.fetch(friendsAddress);

                for (const friendRequest of friendsData['requests']) {
                    const user = await contract.account.user.fetch(friendRequest);
                    requests.push({
                        name: user.name,
                        address: friendRequest
                    });
                }
                
                setNumOfFriendRequests(requests.length);
            } catch (e) {
                console.log(e);
            }
        }

        getFriendRequests();
    })*/

    return (
        <div>
            <div className='header'>
                <h1>POLKADOT BLOGCHAIN</h1>
                <div className="buttons">
                    <button onClick={setFeedView}>FEED</button>
                    <button onClick={setMessageView}>MESSAGES</button>
                    <button onClick={setMyProfileView}>MY PROFILE {/*numOfFriendRequests > 0 ? <span> | {numOfFriendRequests}</span> : <span/>*/} </button>
                </div>
            </div>
            {   view === 'F' ? <FeedComponent currentUser={currentUser} contract={contract} setMessageView={setMessageView} setProfileView={setProfileView} isMod= {isMod} gasLimit={gasLimit} account={account} injector={injector}/> :
                view === 'M' ? <ChatListComponent setProfileView={setProfileView} currentUser={currentUser} contract={contract} gasLimit={gasLimit} account={account} injector={injector}/> :
                view === 'P' ? <MyProfileComponent  currentUser={currentUser} contract={contract} setProfileView={setProfileView} isMod={isMod} username={username} gasLimit={gasLimit} account={account} injector={injector}/> :
                view === 'FP' ? <ForeignProfileComponent key={profileData.foreignAddress} setProfileView={setProfileView} foreignAddress={profileData.foreignAddress} username={profileData.username} currentUser={currentUser} contract={contract} isMod={isMod} gasLimit={gasLimit} account={account} injector={injector} /> : <div/>
            }
        </div>
    )
}