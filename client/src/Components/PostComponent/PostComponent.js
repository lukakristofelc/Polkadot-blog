import React, { Component } from 'react';
import './PostComponent.css';

export default function PostComponent(props) {

  let author = props.author;
  let id = props.id;
  let authorKey = props.authorKey;
  let content = props.content;
  let timestamp = props.timestamp;
  let currentUser = props.currentUser;
  let isProfile = props.isProfile;
  let getPosts = props.getPosts;
  let contract = props.contract;
  let isMod = props.isMod;
  let gasLimit = props.gasLimit;
  let account = props.account;
  let injector = props.injector;

  const deletePost = async () => {
    await contract.tx.deletePost({ gasLimit }, id).signAndSend(account.address, { signer: injector.signer });
  }

  const showProfile = () => {
    props.setProfileView(authorKey, author);
    props.setForeignAddress(authorKey);
    props.setUsername(author);
  }

  return (
    <div className='objava'>
      <div className="objava-content">
        {!isProfile ? <button className='author' onClick={showProfile}>{author}</button> : <div/>}
        <div className='vsebina'>{content}</div>
        <div className='timestamp'>{timestamp}</div>
        {isMod.isTrue ? <button onClick={deletePost}>DELETE</button> : JSON.stringify(authorKey) === JSON.stringify(currentUser['userAddress']) ? <button onClick={deletePost}>DELETE</button> : <div/>}
      </div>
    </div>
)
}