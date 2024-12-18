import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state:()=>{
        return{
            userID:null,
            isLoggedIn:false
        };
    },
    actions:{
        setUserID(val){
            this.userID=val;
        }
    },
    getters:{
        
    }   
})
