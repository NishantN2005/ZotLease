<template>
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

    <div class="relative w-full h-screen">
      <!-- The Leaflet map -->
      <LeafletMap
        class="z-0 w-full h-full"
        :userToken="userStore.userToken"
        :routerPass="router"
        :userID="userStore.userID"
        :turnOnSubleaseModal="turnOnSubleaseModal"
        :filterForm="filterForm"
        :filterStore="filterStore"
      />

      <!-- Your buttons, absolutely positioned on top of the map -->
      <div class="absolute flex justify-center items-center space-x-5 top-5 z-10 w-full">
        <SocketConnection :router="router" />
        <button class="bg-uciblue text-uciyellow font-bold rounded-full p-2 ml-10" @click="Logout">
          Logout
        </button>
        <button
          @click="turnOnModal"
          class="bg-uciblue text-uciyellow font-bold rounded-full p-2 mb-2"
        >
          Create Listing
        </button>
        <br />
        <button
          @click="toggleFilterModal"
          class="bg-uciblue text-uciyellow font-bold rounded-full p-2"
        >
          Filter
          <i class="fas fa-filter"></i>
        </button>
        <br />
        <button
          @click="getChatRoomID"
          class="bg-uciblue text-uciyellow font-bold rounded-full p-2 mb-2"
        >
          Get ChatRoom ID
        </button>
        <br />
        <button
          @click="getOnlineStore"
          class="bg-uciblue text-uciyellow font-bold rounded-full p-2"
        >
          Check Store
        </button>
      </div>
      <!-- Selected Sublease modal-->
      <div
        v-if="showSelectedSubleaseModal"
        class="absolute z-10 bg-white inset-y-2 right-2 w-1/3 rounded-lg p-4"
      >
        <button @click="turnOffSubleaseModal" class="text-gray-600 hover:text-gray-900">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <div class="space-y-5">
          <h1 class="font-bold text-4xl">{{ subleaseStore.fName }} {{ subleaseStore.lName }}</h1>
          <p>Price: ${{ subleaseStore.price }}</p>
          <p>Gender: {{ subleaseStore.gender }}</p>
          <p>Rooms/Bathrooms: {{ subleaseStore.roomCount }}/{{ subleaseStore.bathroomCount }}</p>
          <div class="flex items-center">
            <h1>Address:</h1>
            <p>
              {{ subleaseStore.street_name }}, {{ subleaseStore.city }}, California,
              {{ subleaseStore.postal_code }}
            </p>
          </div>
          <p>Room: {{ subleaseStore.room }}</p>
          <p>Start Term: {{ subleaseStore.startTerm }}</p>
          <p>End Term: {{ subleaseStore.endTerm }}</p>
          <p>Description: {{ subleaseStore.description }}</p>
          <button
            @click="createChatRoom"
            class="bg-uciblue text-uciyellow font-bold rounded-full p-2 mb-2"
          >
            Chat
          </button>
        </div>
      </div>
      <!-- Filter Modal-->
      <FilterModal
        :filterform="filterForm"
        :showFilterModal="showFilterModal"
        :routerPass="router"
        :token="userStore.userToken"
        :toggleFilterModal="toggleFilterModal"
      />
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import LeafletMap from '../components/LeafletMap.vue'
import { useUserStore } from '@/stores/userStore'
import { useSubleaseStore } from '@/stores/subleaseStore'
import SocketConnection from '@/components/SocketConnection.vue'
import CreateSubleaseModal from '@/components/CreateSubleaseModal.vue'
import { refreshAccessToken, makeAuthenticatedRequest } from '@/services/authService'
import { ref } from 'vue'
import { API_URL } from '../../constants.js'
import { onMounted } from 'vue'
import FilterModal from '@/components/FilterModal.vue'
import { useFilterStore } from '@/stores/filterStore'

export default {
  name: 'DashboardView',
  components: {
    LeafletMap,
    SocketConnection,
    CreateSubleaseModal,
    FilterModal,
  },
  setup() {
    onMounted(() => {
      if (userStore.isLoggedIn) {
        userStore.onlineChats = []
        sequencialFetch()
      }
    })

    const router = useRouter()
    const userStore = useUserStore()
    const subleaseStore = useSubleaseStore()
    const filterStore = useFilterStore()

    const showSelectedSubleaseModal = ref(false)
    const showFilterModal = ref(false)
    const filterForm = ref({
      gender: '',
      minPrice: null,
      maxPrice: null,
      roomCount: null,
    })
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

    const createSubleaseModal = ref(false)

    const turnOffModal = () => {
      console.log('modal off')
      createSubleaseModal.value = false
    }
    const turnOnModal = () => {
      console.log('modal on')
      createSubleaseModal.value = true
    }

    const sequencialFetch = async () => {
      await fetchChatRooms()
    }

    const fetchChatRooms = async () => {
      try {
        const response = await makeAuthenticatedRequest(
          'chat/getChatRooms',
          { userID: userStore.userID },
          router,
          userStore.userToken,
        )
        console.log('res', response)
        const result = await response.json()
        console.log(result)
        userStore.setChatRooms(result.chatRooms)
      } catch (error) {
        console.error('Error fetching chat rooms:', error)
      }
    }

    const fetchChats = async () => {
      try {
        const response = await makeAuthenticatedRequest(
          'chat/getOfflineChats',
          { chatRooms: userStore.chatRooms },
          router,
          userStore.userToken,
        )
        const result = await response.json()
        console.log(result)
        userStore.setOfflineChats(result.messages)
      } catch (error) {
        console.error('Error fetching chat rooms:', error)
      }
    }

    // creates chat room whenever user starts chat with new leaser
    async function createChatRoom() {
      const userID1 = userStore.userID
      const userID2 = subleaseStore.listerID
      const res = await makeAuthenticatedRequest(
        `chat/createRoom`,
        { userID1, userID2 },
        router,
        userStore.userToken,
      )
      console.log(res)
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
          userStore.setChatRoomID(null)
          userStore.setChatRooms([])
          userStore.setOfflineChats([])
          userStore.setOnlineChats([])
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

    const getOnlineStore = () => {
      console.log(userStore.onlineChats.length)
    }
    const turnOffSubleaseModal = () => {
      showSelectedSubleaseModal.value = false
    }
    const turnOnSubleaseModal = () => {
      showSelectedSubleaseModal.value = true
    }
    const toggleFilterModal = () => {
      showFilterModal.value = !showFilterModal.value
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
      getOnlineStore,
      subleaseStore,
      showSelectedSubleaseModal,
      turnOffSubleaseModal,
      turnOnSubleaseModal,
      toggleFilterModal,
      showFilterModal,
      filterForm,
      FilterModal,
      filterStore,
    }
  },
}
</script>
