import { useEffect, useState } from 'react';
import './ForeignProfileComponent.css';
import PostComponent from '../PostComponent/PostComponent';
import FriendRequest from '../FriendRequestComponent/FriendRequestComponent';

export default function ForeignProfileComponent(props) {

    let currentUser = props.currentUser;
    let username = props.username;
    let foreignAddress = props.foreignAddress;
    let contract = props.contract;
    let isMod = props.isMod;
    let gasLimit = props.gasLimit;
    let account = props.account;
    let injector = props.injector;

    const [messageContent, setMessageContent] = useState('');
    const [isFriend, setIsFriend] = useState(false);
    const [friends, setFriends] = useState([]);
    const [requestSent, setRequestSent] = useState(false);
    const [requestSentCurrentUser, setRequestSentCurrentUser] = useState(false);
    const [posts, setPosts] = useState([]);

    const removeFriend = async () => {
        await contract.tx.removeFriend({ gasLimit }, foreignAddress).signAndSend(account.address, { signer: injector.signer });
    }
    
    const sendFriendRequest = async () => {
        await contract.tx.sendFriendRequest({ gasLimit }, foreignAddress, currentUser['username']).signAndSend(account.address, { signer: injector.signer });
    }
    
    const getFriendsInfo = async () => {
        try {
            const {output} = await contract.query.getUsers(account.address, { gasLimit });
            let user = output.filter(user => JSON.stringify(user['userAddress']) === JSON.stringify(account.address));
            const requestSentCurrentUser = user[0]['friendRequests'].filter(request => JSON.stringify(request['userAddress']) === JSON.stringify(foreignAddress)).length === 1;

            user = output.filter(user => JSON.stringify(user['userAddress']) === JSON.stringify(foreignAddress));

            const requestSent = user[0]['friendRequests'].filter(request => JSON.stringify(request['userAddress']) === JSON.stringify(currentUser['userAddress'])).length === 1;
            const isFriend = user[0]['friends'].filter(friend => JSON.stringify(friend['userAddress']) === JSON.stringify(currentUser['userAddress'])).length === 1;

            let friends = [];

            for (const friend of user[0]['friends']) {
                friends.push({
                    name: friend.username,
                    address: friend.userAddress
                });
            }

            setFriends(friends);
            setRequestSent(requestSent);
            setRequestSentCurrentUser(requestSentCurrentUser);
            setIsFriend(isFriend);
        } catch (e) {
            console.log(e);
        }
    }

    const getPosts = async () => {
        let { output } = await contract.query.getPosts(account.address, { gasLimit });
        setPosts(filterPosts(orderPosts(output)));
        return output;
    }

    const orderPosts = (posts) => {
        return posts.slice().sort((a, b) => b['timestamp'] - a['timestamp']);
    }

    const filterPosts = (posts) => {
        return posts.filter(post => JSON.stringify(post['author']) === JSON.stringify(foreignAddress));
    }

    useEffect(() => {
        getFriendsInfo();
    })

    useEffect(() => {
        getPosts();
    }, [])

    return (
        <div className='profile'>
            <div className='profile-info'>
                <div className='user-info'>
                    <h2>{username}</h2>
                    <h2>{JSON.stringify(foreignAddress).substring(1, JSON.stringify(foreignAddress).length-1)}</h2>
                    {
                        isFriend ? <button onClick={removeFriend}>REMOVE FRIEND</button> : <div />
                    }
                </div>
                {isFriend ?
                        <div className='friend-requests'>
                            <h2>FRIENDS</h2>
                            { friends.length > 0 ?
                                friends.map(friend => 
                                    <button onClick={() => props.setProfileView(friend['address'], friend['username'])} key={friend['address']}>{friend['name']}</button>
                                ) : <p id='no-friends'>You don't have any friends.</p>
                            }
                        </div> : 
                    <div className='friend-requests'>
                        {
                            requestSentCurrentUser ?
                                <div>
                                    <h2>You have a pending friend request from {username}</h2>
                                    <FriendRequest  foreignProfile={true} 
                                                    contract={contract} 
                                                    name={username} 
                                                    address={foreignAddress}
                                                    currentUser={currentUser}
                                                    gasLimit={gasLimit}
                                                    account={account}
                                                    injector={injector}
                                    />
                                </div> : !requestSent ?
                                <div>
                                    <h2>You need to be friends with {username} to see their friends.</h2>
                                    <button onClick={(sendFriendRequest)}>SEND FRIEND REQUEST</button>
                                </div> : 
                                <div>
                                    <h2>Friend request has been sent.</h2>
                                </div>
                        }
                    </div>
                }
            </div>
            {posts.length === 0 ?
                <div className='no-posts'> 
                    <h2 id='posts-title'>POSTS</h2> 
                    <p>{username} has no posts to display.</p> 
                </div> : 
                <div className='posts'>
                    <h2>POSTS</h2>
                    {
                        posts.map(post =>   <PostComponent      key={post['id']}
                                                                id={post['id']}
                                                                author={post['username']}
                                                                authorKey={post['author'].toString()} 
                                                                content={post['content']} 
                                                                timestamp={new Date(parseInt(post['timestamp'].toString())).toLocaleString()}
                                                                contract={contract}
                                                                account={account}
                                                                injector={injector}
                                                                gasLimit={gasLimit}
                                                                isMod={isMod}
                                                                getPosts={getPosts}
                                                                isProfile={true}
                                                                currentUser={currentUser}
                        />)
                    }
                </div>
            }
        </div>)
}