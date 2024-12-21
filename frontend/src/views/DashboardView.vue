<template>
  <div class="dashboard">
    <div v-if="createSubleaseModal" class="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
      <div class="bg-white p-4 shadow-lg rounded-lg ">
        <h1 class="font-bold flex justify-center items-center text-xl mb-5">Enter Sublease Information</h1>
        <form class="space-y-5">

          <div>
            <label>Street Name: </label>
            <input
              v-model="formData.street_name"
              type ="text"
              name="address"
              id="address"
              placeholder="1234 Arroyo Dr, CA 92617"
              class="mr-5"
            />
            <label>Room/Unit: </label>
            <input
              v-model="formData.room"
              type ="text"
              name="room"
              id="room"
              placeholder="3B"
              class="mr-5"
            />

            <label>City: </label>
            <input
              v-model="formData.city"
              type ="text"
              name="city"
              id="city"
              placeholder="Irvine"
              class="mr-5"
            />

            <label> 
              State: 
            </label>
            <input
              v-model="formData.state"
              type="text"
              name="state"
              id="state"
              placeholder="CA"
              maxlength="2"
              class="mr-5 object-fit pd-1"
            />

            <label>
              Country
            </label>
            <input
              v-model="formData.country"
              type="text"
              name="country"
              id="country"
              placeholder="United States"
            />

            <label>Postal Code: </label>
            <input
            v-model="formData.postal_code"
            type="text"
            name="postal"
            id="postal"
            placeholder="92617"
            class="mr-5"
            />
          </div>


          <div>
            <label>Gender: </label>
            <input
            v-model="formData.gender"
            type="text"
            name="gender"
            id="gender"
            placeholder="Male"
            class="mr-5"
            />

            <label>Price: </label>
            <input
            v-model="formData.price"
            type="number"
            name="price"
            id="price"
            placeholder=1200
            />

          </div>

          <div>
            <label>Number of total rooms in unit: </label>
            <input
              v-model="formData.roomCount"
              type="number"
              name="roomCount"
              id="roomCount"
              placeholder="4"
              class="mr-5"
            />

            <label>Number of total bathrooms in unit: </label>
            <input
              v-model="formData.bathroomCount"
              type="number"
              name="bathroomCount"
              id="bathroomCount"
              placeholder="5"
            />
          </div>

          <div>
          </div>

          <div>
            <label>startTerm: </label>
            <input
              v-model="formData.startTerm"
              type="date"
              name="startTerm"
              id="startTerm"
              placeholder="06/16/25"
              class="mr-5"
            />

            <label>endTerm: </label>
            <input
              v-model="formData.endTerm"
              type="date"
              name="endTerm"
              id="endTerm"
              placeholder="08/24/25"
            />
          </div>

          <div class="flex items-top justify-start">
            <label class="mr-5">Description: </label>
            <textarea
            rows="4"
            cols="42"
            v-model="formData.description"
            name="description"
            id="description"
            placeholder="There is going to be another 2 subleasers. No pets allowed. No furniture provided."
            />
          </div>
        </form>
        <div class="flex items-center justify-center mt-5">
          <button @click="turnOffModal" class="mx-10 px-3 border-2 border-black rounded-md hover:text-uciyellow hover:bg-uciblue">Cancel</button>
          <button @click="createListing" class="mx-10 border-2 border-black px-3 rounded-md hover:text-uciyellow hover:bg-uciblue">Post Sublease</button>
        </div>
      </div>
    </div>
    <h1>This is a Dashboard Page</h1>
    <LeafletMap class="z-10"/>
    <h1>Hello user</h1>
    <button @click="callTestRoute">Call /test Route</button>
    <button class="border ml-10" @click="Logout">Logout</button>
    <button @click="turnOnModal" class="bg-uciblue text-uciyellow font-bold rounded-full p-2 ml-10"> Create Listing</button>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import LeafletMap from '@/components/icons/LeafletMap.vue'
import { useUserStore } from '@/stores/userStore'
import { refreshAccessToken } from '@/services/authService'
import { ref } from 'vue';

export default {
  name: 'DashboardView',
  components: {
    LeafletMap,
  },
  setup() {
    const router = useRouter()
    const userStore = useUserStore()

    const formData = ref({
      street_name:'',
      room:'',
      city:'',
      state:'',
      country:'',
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
        console.log(formData.value)
        let response = await fetch('http://localhost:5555/sublease/create', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userStore.userToken}`,
          },
          body:JSON.stringify(formData.value),
        })
        console.log(response)
      }catch(err){
        console.log("Error creating listing: ", err);
      }
    }
    const Logout = async () => {
      try {
        let response = await fetch('http://localhost:5555/auth/logout', {
          method: 'POST',
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${userStore.userToken}`,
          },
        })
        console.log(response)
        if (response.status == 200) {
          userStore.setIsLoggedIn(false)
          userStore.setUserToken(null)
          userStore.setUserID(null)
          router.push('/login')
        }
      } catch (err) {
        console.log(err)
      }
    }
    const callTestRoute = async () => {
      try {
        let response = await fetch('http://localhost:5555/user/test', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${userStore.userToken}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          console.log('Response from /test:', data)
        } else {
          const errorData = await response.json()
          console.log('Error:', errorData.message)

          // if 401 unauthorized call refresh token
          if (response.status === 401) {
            const newAccessToken = await refreshAccessToken(router)
            if (newAccessToken) {
              // call api again using new access token
              response = await fetch('http://localhost:5555/user/test', {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${newAccessToken}`,
                },
              })

              if (response.ok) {
                const data = await response.json()
                console.log('Retry Response from /test:', data)
              } else {
                console.log('Failed to retry /test:', await response.json())
                navigateToLogin()
              }
            }
          }
        }
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
      createListing
    }
  },
}
</script>

<style></style>
