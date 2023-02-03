import { useEffect, useState } from 'react';
import './FeedComponent.css';
import PostComponent from '../PostComponent/PostComponent';

export default function FeedComponent(props) {

    let currentUser = props.currentUser;
    let contract = props.contract;
    let isMod = props.isMod;
    let gasLimit = props.gasLimit;
    let account = props.account;
    let injector = props.injector;

    const [username, setUsername] = useState('');
    const [foreignAddress, setForeignAddress] = useState('');
    const [input, setInput] = useState('');
    const [posts, setPosts] = useState([]);

    const addPost = async () => {
      if (!input) return

      await contract.tx.addPost({ gasLimit }, input, currentUser['username'] ).signAndSend(account.address, { signer: injector.signer });
      setInput('');
    }

    const getPosts = async () => {
      let { output } = await contract.query.getPosts(account.address, { gasLimit });
      setPosts(orderPosts(output));
      return output;
    }

    const orderPosts = (posts) => {
        return posts.slice().sort((a, b) => b['timestamp'] - a['timestamp']);
    }

    useEffect(() => {
      getPosts();
    });

    return( 
        <div>
            <textarea 
                type="text"
                placeholder="Insert new post"
                onChange={e => setInput(e.target.value)}
                value={input}
                rows="8" cols="50"
            />
            <br/>
            <button onClick={addPost}>POST</button> <br/>
            {
            posts.map(post =>
                  <PostComponent    key={post['id']}
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
                                    isProfile={false}
                                    setProfileView={props.setProfileView}
                                    setForeignAddress={setForeignAddress}
                                    setUsername={setUsername}
                                    currentUser={currentUser}
                />)
            }
        </div>)
}