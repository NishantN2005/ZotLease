<template>
  <SocketConnection :router="router" />
  <h1>Hello user</h1>
  <button @click="callTestRoute">Call /test Route</button>
  <button class="border ml-10" @click="Logout">Logout</button>
  <div class="dashboard">
    <!-- Sublease Modal -->
    <div
      v-if="createSubleaseModal"
      class="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm"
    >
      <div class="bg-white p-4 shadow-lg rounded-lg">
        <h1 class="font-bold flex justify-center items-center text-xl mb-5">
          Enter Sublease Information
        </h1>
        <h1 v-if="formError.display" class="flex justify-center text-rose-500 italic mb-4">
          *{{ formError.message }}
        </h1>
        <CreateSubleaseModal :formData="formData" />
        <div class="flex items-center justify-center mt-5">
          <button
            @click="turnOffModal"
            class="mx-10 px-3 border-2 border-black rounded-md hover:text-uciyellow hover:bg-uciblue"
          >
            Cancel
          </button>
          <button
            @click="createListing"
            class="mx-10 border-2 border-black px-3 rounded-md hover:text-uciyellow hover:bg-uciblue"
          >
            Post Sublease
          </button>
        </div>
      </div>
    </div>

    <!-- Other content -->
    <h1>This is a Dashboard Page</h1>
    <LeafletMap
      class="z-10"
      :userToken="userStore.userToken"
      :routerPass="router"
      :userID="userStore.userID"
    />

    <button @click="turnOnModal" class="bg-uciblue text-uciyellow font-bold rounded-full p-2 ml-10">
      Create Listing
    </button>
    <button
      @click="createChatRoom"
      class="bg-uciblue text-uciyellow font-bold rounded-full p-2 ml-10"
    >
      Chat
    </button>
    <button
      @click="getChatRoomID"
      class="bg-uciblue text-uciyellow font-bold rounded-full p-2 ml-10"
    >
      Get ChatRoom ID
    </button>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import LeafletMap from '../components/LeafletMap.vue'
import { useUserStore } from '@/stores/userStore'
import SocketConnection from '@/components/SocketConnection.vue'
import CreateSubleaseModal from '@/components/CreateSubleaseModal.vue'
import { refreshAccessToken, makeAuthenticatedRequest } from '@/services/authService'
import { ref } from 'vue'
import { API_URL } from '../../constants.js'

export default {
  name: 'DashboardView',
  components: {
    LeafletMap,
    SocketConnection,
    CreateSubleaseModal,
  },
  setup() {
    const router = useRouter()
    const userStore = useUserStore()

    const formError = ref({
      message: '',
      display: false,
    })
    const formData = ref({
      street_name: '',
      room: '',
      city: '',
      postal_code: '',
      listerID: userStore.userID,
      price: '',
      gender: '',
      roomCount: '',
      bathroomCount: '',
      startTerm: '',
      endTerm: '',
      description: '',
    })

    // hard coded userIDS for now
    const chatRoomFormData = ref({
      userID1: '01',
      userID2: '02',
    })

    const createSubleaseModal = ref(false)

    const turnOffModal = () => {
      console.log('modal off')
      createSubleaseModal.value = false
    }
    const turnOnModal = () => {
      console.log('modal on')
      createSubleaseModal.value = true
    }

    // creates chat room whenever user starts chat with new leaser
    async function createChatRoom() {
      let response = await makeAuthenticatedRequest(
        `chat/createRoom`,
        chatRoomFormData.value,
        router,
        userStore.userToken,
      )
      console.log(response)
    }

    // gets chatroom id so u can send it through message posts to categorize
    async function getChatRoomID() {
      let response = await makeAuthenticatedRequest(
        `chat/chatRoomID`,
        chatRoomFormData.value,
        router,
        userStore.userToken,
      )
      const textRes = await response.json()

      userStore.setChatRoomID(textRes.chatRoomID)
    }

    async function createListing() {
      try {
        formError.display = false
        let response = await makeAuthenticatedRequest(
          `sublease/create`,
          formData.value,
          router,
          userStore.userToken,
        )
        console.log(response)

        if (response.status == 200) {
          //reset state of dashboard
          createSubleaseModal.value = false
          formData.value = {
            street_name: '',
            room: '',
            city: '',
            postal_code: '',
            listerID: userStore.userID,
            price: '',
            gender: '',
            roomCount: '',
            bathroomCount: '',
            startTerm: '',
            endTerm: '',
            description: '',
          }
        } else if (response.status == 400) {
          //something wrong with form input
          console.log('Form was incorrectly submitted')
          formError.value.display = true
          let resp = await response.json()
          console.log(resp.message)
          if (resp.message == 'Params are incomeplete') {
            //message being set correctly
            formError.value.message = 'Make sure you entered all required information'
          } else if (resp.message == 'Address does not exist') {
            //set message correctly
            formError.value.message = 'Address provided is invalid, make sure it is in California'
          }
        } else if (response.status == 500) {
          alert('Something went bad on our end :(. Our apologies, try again later or report a bug)')
          //reset state of dashboard
          createSubleaseModal.value = false
          formData.value = {
            street_name: '',
            room: '',
            city: '',
            postal_code: '',
            listerID: userStore.userID,
            price: '',
            gender: '',
            roomCount: '',
            bathroomCount: '',
            startTerm: '',
            endTerm: '',
            description: '',
          }
        }
      } catch (err) {
        console.log('Error creating listing: ', err)
      }
    }
    const Logout = async () => {
      try {
        let response = await makeAuthenticatedRequest(
          'auth/logout',
          {},
          router,
          userStore.userToken,
        )
        console.log(response)

        if (response.status == 200) {
          userStore.setIsLoggedIn(false)
          userStore.setUserToken(null)
          userStore.setUserID(null)
          router.push('/login')
        } else {
          const resp = await response.json()
          console.log(resp.message)
        }
      } catch (err) {
        console.log(err)
      }
    }

    const callTestRoute = async () => {
      try {
        let response = await makeAuthenticatedRequest('user/test', {}, router, userStore.userToken)
        console.log(response)
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
      createChatRoom,
      getChatRoomID,
      router,
      userStore,
    }
  },
}
</script>
