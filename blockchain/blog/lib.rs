#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod blog {
    use ink_prelude::string::String;
    use ink_prelude::vec::Vec;
    use ink_storage::traits::PackedLayout;
    use ink_storage::traits::SpreadLayout;
    use ink_storage::traits::SpreadAllocate;
    use ink_storage::traits::PackedAllocate;
    use ink_storage::Mapping;
    use ink_primitives::Key;
    use scale::Encode;
    use scale::Decode;

    #[ink(storage)]
    #[derive(SpreadAllocate)]
    pub struct Blogchain {
        posts: Vec<Post>,
        users: Vec<User>,
        chats: Mapping<(AccountId, AccountId), Vec<Message>>
    }

    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    #[derive(PackedLayout, SpreadLayout, SpreadAllocate, Encode, Decode, Clone)]
    pub struct Post {
        id: u64,
        username: String,
        author: AccountId,
        content: String,
        timestamp: u64
    }

    impl PackedAllocate for Post {
        fn allocate_packed(&mut self, at: &Key){
            PackedAllocate::allocate_packed(&mut *self, at)
        }
    }

    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    #[derive(PackedLayout, SpreadLayout, SpreadAllocate, Encode, Decode, Clone)]
    pub struct User {
        user_address: AccountId,
        username: String,
        is_mod: bool,
        friend_requests: Vec<FriendRequest>,
        friends: Vec<Friend>
    }

    impl PackedAllocate for User {
        fn allocate_packed(&mut self, at: &Key){
            PackedAllocate::allocate_packed(&mut *self, at)
        }
    }

    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    #[derive(PackedLayout, SpreadLayout, SpreadAllocate, Encode, Decode, Clone)]
    pub struct FriendRequest {
        user_address: AccountId,
        username: String,
    }

    impl PackedAllocate for FriendRequest {
        fn allocate_packed(&mut self, at: &Key){
            PackedAllocate::allocate_packed(&mut *self, at)
        }
    }

    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    #[derive(PackedLayout, SpreadLayout, SpreadAllocate, Encode, Decode, Clone)]
    pub struct Friend {
        user_address: AccountId,
        username: String,
    }

    impl PackedAllocate for Friend {
        fn allocate_packed(&mut self, at: &Key){
            PackedAllocate::allocate_packed(&mut *self, at)
        }
    }

    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    #[derive(PackedLayout, SpreadLayout, SpreadAllocate, Encode, Decode, Clone)]
    pub struct Message {
        from: AccountId,
        to: AccountId,
        content: String,
        timestamp: u64
    }

    impl PackedAllocate for Message {
        fn allocate_packed(&mut self, at: &Key){
            PackedAllocate::allocate_packed(&mut *self, at)
        }
    }

    impl Blogchain {
        #[ink(constructor)]
        pub fn default() -> Self {
            ink_lang::utils::initialize_contract(|contract: &mut Self| {
                contract.posts = Vec::new();
                contract.users = Vec::new();
                contract.chats = Mapping::default();
            })
        }

        #[ink(message)]
        pub fn get_posts(&self) -> Vec<Post> {
            self.posts.clone()
        }

        #[ink(message)]
        pub fn get_users(&self) -> Vec<User> {
            self.users.clone()
        }

        #[ink(message)]
        pub fn add_post(&mut self, new_message: String, username: String) {
            log::info!("{}", new_message);

            self.posts.push(Post{
                id: self.posts.len() as u64,
                username: username,
                author: self.env().caller(),
                content: new_message,
                timestamp: self.env().block_timestamp()
            });
        }

        #[ink(message)]
        pub fn create_user(&mut self, username: String, is_mod: bool) {
            self.users.push(User{
                user_address: self.env().caller(),
                username: username,
                is_mod: is_mod,
                friend_requests: Vec::new(),
                friends: Vec::new()
            });
        }

        #[ink(message)]
        pub fn delete_post(&mut self, post_id: u64) {
            self.posts.retain(|post| post.id != post_id);
        }
        
        #[ink(message)]
        pub fn send_friend_request(&mut self, potential_friend_address: AccountId, username: String) {        
            let requester_address = self.env().caller();

            let index_user1 = self.users.iter().position(|user| user.user_address == potential_friend_address).unwrap();
            self.users[index_user1].friend_requests.push(FriendRequest{
                user_address: requester_address, 
                username: username
            });
        }
        
        #[ink(message)]
        pub fn handle_friend_request(&mut self, accepted: bool, potential_friend_address: AccountId) {            
            let requester_address = self.env().caller();

            let index_user1 = self.users.iter().position(|user| user.user_address == potential_friend_address).unwrap();
            let index_user2 = self.users.iter().position(|user| user.user_address == requester_address).unwrap();
            
            let user1 = self.users[index_user1].clone();
            let user2 = self.users[index_user2].clone();

            if accepted {
                self.users[index_user1].friends.push(Friend{
                    user_address: user2.user_address,
                    username: user2.username.clone()
                });

                self.users[index_user2].friends.push(Friend{
                    user_address: user1.user_address,
                    username: user1.username.clone()
                });

                let index_request = self.users[index_user2].friend_requests.iter().position(|request| request.user_address == potential_friend_address).unwrap();
                self.users[index_user2].friend_requests.remove(index_request);
            } else {
                let index_request = self.users[index_user2].friend_requests.iter().position(|request| request.user_address == potential_friend_address).unwrap();
                self.users[index_user2].friend_requests.remove(index_request);
            }
        }
        
        
        #[ink(message)]
        pub fn remove_friend(&mut self, former_friend_address: AccountId) {
            let current_user_address = self.env().caller();
            let mut index_of_current_user = self.users.iter().position(|user| user.user_address == current_user_address).unwrap();
            let mut index_of_former_friend = self.users[index_of_current_user].friends.iter().position(|friend| friend.user_address == former_friend_address).unwrap();

            self.users[index_of_current_user].friends.remove(index_of_former_friend);

            index_of_former_friend = self.users.iter().position(|user| user.user_address == former_friend_address).unwrap();
            index_of_current_user = self.users[index_of_former_friend].friends.iter().position(|friend| friend.user_address == current_user_address).unwrap();

            self.users[index_of_former_friend].friends.remove(index_of_current_user);
        }

        #[ink(message)]
        pub fn send_message(&self, user1: AccountId, user2: AccountId, new_message: String) {
            let sender;
            let reciever;

            if user1 == self.env().caller() {
                sender = user1;
                reciever = user2;
            }
            else
            {
                sender = user2;
                reciever = user1
            }

            let mut new_chat = self.chats.get(&(user1, user2)).unwrap_or_default();
            
            new_chat.push(Message{
                from: sender,
                to: reciever,
                content: new_message,
                timestamp: self.env().block_timestamp()
            });

            ink_lang::utils::initialize_contract(|contract: &mut Self| {
                contract.chats.insert(&(user1, user2), &new_chat)
            });
        }

        #[ink(message)]
        pub fn get_chat(&self, user1: AccountId, user2: AccountId) -> Vec<Message> {
           self.chats.get(&(user1, user2)).unwrap_or_default()
        }
    }
}