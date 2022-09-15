#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod blog {
    use ink_prelude::string::String;
    use ink_prelude::vec::Vec;
    use ink_storage::traits::PackedLayout;
    use ink_storage::traits::SpreadLayout;
    use scale::Encode;
    use scale::Decode;

    #[ink(storage)]
    pub struct Objave {
        objave: Vec<Objava>
    }

    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    #[derive(PackedLayout, SpreadLayout, Encode, Decode, Clone)]
    pub struct Objava {
        avtor: AccountId,
        vsebina: String,
        timestamp: u64
    }

    impl Objave {
        #[ink(constructor)]
        pub fn default() -> Self {
            Self {
                objave: Vec::new()
            }
        }

        #[ink(message)]
        pub fn vseObjave(&self) -> Vec<Objava> {
            self.objave.clone()
        }

        #[ink(message)]
        pub fn dodajObjavo(&mut self, new_message: String) {
            self.objave.push(Objava{
                avtor: self.env().caller(),
                vsebina: new_message,
                timestamp: self.env().block_timestamp()
            });
        }
    }
}