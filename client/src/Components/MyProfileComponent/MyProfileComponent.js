import { useEffect, useState } from 'react';
import './MyProfileComponent.css';
import PostComponent from '../PostComponent/PostComponent';
import FriendRequest from '../FriendRequestComponent/FriendRequestComponent';

export default function MyProfileComponent(props) {

    let currentUser = props.currentUser;
    let contract = props.contract;
    let setProfileView = props.setProfileView;
    let isMod = props.isMod;
    let username = props.username;
    let gasLimit = props.gasLimit;
    let account = props.account;
    let injector = props.injector;

    const [friendRequests, setFriendRequests] = useState([]);
    const [friends, setFriends] = useState([]);
    const [posts, setPosts] = useState([]);

    const getFriendsData = async () => {
        const {output} = await contract.query.getUsers(account.address, { gasLimit });
        const user = output.filter(user => JSON.stringify(user['userAddress']) === JSON.stringify(currentUser['userAddress']));
        setFriendRequests(user[0]['friendRequests']);
        setFriends(user[0]['friends']);
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
        return posts.filter(post => JSON.stringify(post['author']) === JSON.stringify(currentUser['userAddress']));
    }

    useEffect(() => {
        getFriendsData();
    });

    useEffect(() => {
        getPosts();
    });
    
    return (
        <div className='profile'>
            <div className='profile-info'>
                <div className='user-info'>
                    <h2>{currentUser['username']}</h2>
                    <h2>{JSON.stringify(currentUser['userAddress']).substring(1, JSON.stringify(currentUser['userAddress']).length-1)}</h2>
                </div>
                <div className='friend-requests'>
                    <h2>FRIEND REQUESTS</h2>
                    { friendRequests.length > 0 ?
                        friendRequests.map(friendRequest => 
                            <FriendRequest  key={friendRequest['userAddress']}
                                            contract={contract} 
                                            name={friendRequest['username']} 
                                            address={friendRequest['userAddress']}
                                            setProfileView={setProfileView}
                                            currentUser={currentUser}
                                            foreignProfile={false}
                                            gasLimit={gasLimit}
                                            account={account}
                                            injector={injector}
                            />) : <p id='no-friends'>You don't have any friend requests at this moment.</p>
                    }
                </div>
                <div className='friend-requests'>
                    <h2>FRIENDS</h2>
                    { friends.length > 0 ?
                        friends.map(friend => 
                            <button onClick={() => props.setProfileView(friend['userAddress'], friend['username'])} key={friend['userAddress']}>{friend['username']}</button>
                        ) : <p id='no-friends'>You don't have any friends.</p>
                    }
                </div>   
            </div>
            {posts.length === 0 ?
                <div className='no-posts'> 
                    <h2 id='posts-title'>POSTS</h2> 
                    <p>You have no posts to display.</p> 
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