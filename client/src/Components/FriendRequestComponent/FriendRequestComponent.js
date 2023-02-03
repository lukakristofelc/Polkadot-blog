import React, { Component } from 'react';
import './FriendRequestComponent.css';

export default function FriendRequest(props) {

    let contract = props.contract;
    let name = props.name;
    let address = props.address;
    let foreignProfile = props.foreignProfile;
    let currentUser = props.currentUser;
    let gasLimit = props.gasLimit;
    let account = props.account;
    let injector = props.injector;

    const goToProfile = () => {
        props.setProfileView(address, name);
    }

    const acceptRequest = async () => {
        await contract.tx.handleFriendRequest({ gasLimit }, true, address).signAndSend(account.address, { signer: injector.signer });
    }

    const declineRequest = async () => {
        await contract.tx.handleFriendRequest({ gasLimit }, false, address).signAndSend(account.address, { signer: injector.signer });
    }


    return (
        <div>
            {!foreignProfile ? <button onClick={goToProfile}>{name}</button> : <div/>}
            <button onClick={acceptRequest}>ACCEPT</button>
            <button onClick={declineRequest}>DECILNE</button>
        </div>
    )
}