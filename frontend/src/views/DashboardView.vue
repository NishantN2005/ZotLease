<template>
  <div class="dashboard">
    <div v-if="createSubleaseModal" class="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
      <div class="bg-white p-4 shadow-lg rounded-lg ">
        <h1 class="font-bold flex justify-center items-center text-xl mb-5">Enter Sublease Information</h1>
        <h1 v-if="formError.display" class='flex justify-center text-rose-500 italic mb-4'>*{{formError.message}}</h1>
        <CreateSubleaseModal :formData="formData"/>
        <div class="flex items-center justify-center mt-5">
          <button @click="turnOffModal" class="mx-10 px-3 border-2 border-black rounded-md hover:text-uciyellow hover:bg-uciblue">Cancel</button>
          <button @click="createListing" class="mx-10 border-2 border-black px-3 rounded-md hover:text-uciyellow hover:bg-uciblue">Post Sublease</button>
        </div>
      </div>
    </div>
    <h1>This is a Dashboard Page</h1>
    <LeafletMap class='z-10':userToken="userStore.userToken" :routerPass="router" :userID="userStore.userID" />
    <h1>Hello user</h1>
    <button @click="callTestRoute">Call /test Route</button>
    <button class="border ml-10" @click="Logout">Logout</button>
    <button @click="turnOnModal" class="bg-uciblue text-uciyellow font-bold rounded-full p-2 ml-10"> Create Listing</button>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';
import LeafletMap from '../components/LeafletMap.vue';
import CreateSubleaseModal from '../components/CreateSubleaseModal.vue';
import { useUserStore } from '@/stores/userStore';
import { refreshAccessToken,makeAuthenticatedRequest} from '@/services/authService';
import { ref } from 'vue';
import {API_URL} from '../../constants.js';

export default {
  name: 'DashboardView',
  components: {
    LeafletMap,
    CreateSubleaseModal
  },
  setup() {
    const router = useRouter()
    const userStore = useUserStore()

    const formError=ref({
      message:'',
      display:false
    })
    const formData = ref({
      street_name:'',
      room:'',
      city:'',
      postal_code:'',
      listerID: userStore.userID,
      price:'',
      gender:'',
      roomCount:'',
      bathroomCount:'',
      startTerm:'',
      endTerm:'',
      description:''
    })

    const createSubleaseModal = ref(false);

    const turnOffModal = ()=>{
      console.log('modal off');
      createSubleaseModal.value = false;
    }
    const turnOnModal = ()=>{
      console.log('modal on');
      createSubleaseModal.value=true;
    }
    async function createListing(){
      try{
        formError.display=false;
        let response = await makeAuthenticatedRequest(`sublease/create`, formData.value, router,userStore.userToken);
        console.log(response)
        
        if(response.status==200){
          //reset state of dashboard
          createSubleaseModal.value=false;
          formData.value = {
            street_name:'',
            room:'',
            city:'',
            postal_code:'',
            listerID: userStore.userID,
            price:'',
            gender:'',
            roomCount:'',
            bathroomCount:'',
            startTerm:'',
            endTerm:'',
            description:''
          }
        }else if(response.status==400){//something wrong with form input
          console.log('Form was incorrectly submitted')
          formError.value.display=true;
          let resp = await response.json();
          console.log(resp.message);
          if(resp.message=="Params are incomeplete"){
            //message being set correctly
            formError.value.message='Make sure you entered all required information'
          }else if(resp.message=='Address does not exist'){
            //set message correctly
            formError.value.message='Address provided is invalid, make sure it is in California'
          }
      }else if(response.status==500){
        alert('Something went bad on our end :(. Our apologies, try again later or report a bug)');
        //reset state of dashboard
        createSubleaseModal.value=false;
          formData.value = {
            street_name:'',
            room:'',
            city:'',
            postal_code:'',
            listerID: userStore.userID,
            price:'',
            gender:'',
            roomCount:'',
            bathroomCount:'',
            startTerm:'',
            endTerm:'',
            description:''
          }
      }
    }catch(err){
        console.log("Error creating listing: ", err);
      }}
    const Logout = async () => {
      try {
        let response = await makeAuthenticatedRequest('auth/logout',{}, router, userStore.userToken);
        console.log(response);
  
        if (response.status==200) {
          userStore.setIsLoggedIn(false)
          userStore.setUserToken(null)
          userStore.setUserID(null)
          router.push('/login')
        }else{
          const resp = await response.json();
          console.log(resp.message);
        }
      } catch (err) {
        console.log(err)
      }
    }
    const callTestRoute = async () => {
      try {

        let response = await makeAuthenticatedRequest('user/test',{}, router, userStore.userToken);
        console.log(response);

      } catch (error) {
        console.log('Failed to call /test route:', error)
        navigateToLogin()
      }
    }

    const navigateToLogin = () => {
      router.push('/login')
    }

    return {
      callTestRoute,
      navigateToLogin,
      Logout,
      turnOnModal,
      turnOffModal,
      createSubleaseModal,
      formData,
      formError,
      createListing,
      userStore,
      router
    }
  },
}
</script>

<style></style>
