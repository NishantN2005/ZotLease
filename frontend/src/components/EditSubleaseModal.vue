<template>
  <div v-if="show" class="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm">
    <div
      class="bg-white rounded-lg shadow-md w-full max-w-2xl flex flex-col relative h-[100dvh] md:h-[95dvh]"
    >
      <!-- Header -->
      <div class="p-6 pb-4">
        <h3 class="text-xl text-black font-bold text-center w-full">Edit Sublease Information</h3>
      </div>

      <!-- Scrollable Form Content -->
      <form @submit.prevent="submitForm" class="flex-1 overflow-y-auto p-6 pt-0">
        <div class="space-y-4 font-Sriracha text-black">
          <mapbox-address-autofill
            :accessToken="MAPBOX_ACCESS_TOKEN"
            :options="{ countries: ['us'] }"
            confirm-on-blur
            confirm-on-browser-autofill
            @retrieve="onRetrieve"
          >
            <div>
              <label>Address:</label>
              <br />
              <input
                v-model="formData.street_name"
                type="text"
                name="address-line1"
                id="address-input"
                placeholder="Street Address"
                autocomplete="address-line1"
                class="mr-5 mt-1 border border-uciblue rounded-lg p-1 w-[70%]"
              />
              <input
                v-model="formData.room"
                type="text"
                name="address-line2"
                id="room"
                placeholder="Room/Unit"
                autocomplete="address-line2"
                class="mr-5 border border-uciblue rounded-lg p-1 w-[20%]"
              />
              <br />
              <input
                v-model="formData.city"
                type="text"
                name="address-level2"
                id="city"
                placeholder="City"
                autocomplete="address-level2"
                class="mr-5 mt-2 border border-uciblue rounded-lg p-1 w-[45%]"
              />
              <input
                v-model="formData.postal_code"
                type="text"
                name="postal-code"
                id="postal"
                placeholder="Postal / Zip Code"
                autocomplete="postal-code"
                class="mr-5 mt-2 border border-uciblue rounded-lg p-1 w-[45%]"
              />
            </div>

            <div class="flex flex-wrap">
              <input
                v-model="formData.state"
                type="text"
                name="address-level1"
                id="state"
                placeholder="State"
                autocomplete="address-level1"
                class="mr-5 mt-2 border border-uciblue rounded-lg p-1 w-[45%]"
              />
              <input
                v-model="formData.country"
                type="text"
                name="country"
                id="country"
                placeholder="Country"
                autocomplete="country-name"
                class="mr-5 mt-2 border border-uciblue rounded-lg p-1 w-[45%]"
              />
            </div>
          </mapbox-address-autofill>

          <div>
            <label>Gender:</label>
            <div class="flex flex-col space-y-2 mt-1 w-[93%]">
              <label class="inline-flex items-center border border-uciblue rounded-lg p-1">
                <input type="radio" value="Male" v-model="formData.gender" class="mr-1" />
                Male
              </label>
              <label class="inline-flex items-center border border-uciblue rounded-lg p-1">
                <input type="radio" value="Female" v-model="formData.gender" class="mr-1" />
                Female
              </label>
              <label class="inline-flex items-center border border-uciblue rounded-lg p-1">
                <input type="radio" value="Other" v-model="formData.gender" class="mr-1" />
                Other
              </label>
            </div>
          </div>

          <div class="space-y-2">
            <div>
              <label>Price: </label>
              <br />
              <input
                v-model="formData.price"
                type="number"
                name="price"
                id="price"
                placeholder="USD"
                class="w-[93%] border border-uciblue rounded-lg p-1 mt-1"
              />
            </div>

            <div>
              <label>Room Information:</label>
              <br />
              <input
                v-model="formData.roomcount"
                type="number"
                name="roomCount"
                id="roomCount"
                placeholder="Number of Rooms"
                class="mr-2 border border-uciblue rounded-lg p-1 w-[45%] mt-1"
              />
              <input
                v-model="formData.bathroomcount"
                type="number"
                name="bathroomCount"
                id="bathroomCount"
                placeholder="Number of Bathrooms"
                class="border border-uciblue rounded-lg p-1 w-[46%]"
              />
            </div>
          </div>

          <div class="flex flex-col space-y-2 w-[93%]">
            <div class="flex items-center space-x-4">
              <label for="startTerm" class="w-1/4">Start Term:</label>
              <input
                v-model="formData.startterm"
                type="date"
                name="startTerm"
                id="startTerm"
                class="text-gray-500 w-[72%] p-1 border border-uciblue rounded-lg"
              />
            </div>
            <div class="flex items-center space-x-4">
              <label for="endTerm" class="w-1/4">End Term:</label>
              <input
                v-model="formData.endterm"
                type="date"
                name="endTerm"
                id="endTerm"
                class="text-gray-500 w-[72%] p-1 border border-uciblue rounded-lg"
              />
            </div>
          </div>

          <div class="flex flex-col items-top justify-start w-[93%] space-y-1">
            <label class="mr-5">Description: </label>
            <textarea
              rows="4"
              cols="42"
              v-model="formData.description"
              name="description"
              id="description"
              placeholder="There is going to be another 2 subleasers. No pets allowed. No furniture provided."
              class="p-1 border border-uciblue rounded-lg"
            />
          </div>
        </div>
      </form>

      <!-- Sticky Footer -->
      <div class="border-t border-gray-200 p-6">
        <div class="flex items-center justify-center">
          <button
            type="button"
            @click="closeModal"
            class="mx-10 px-3 py-2 border-2 border-black text-black rounded-md hover:text-neutral-900 hover:bg-neutral-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            @click="submitForm"
            class="mx-10 px-3 py-2 border-2 border-black text-black rounded-md hover:text-neutral-900 hover:bg-neutral-200 whitespace-nowrap"
          >
            Update Sublease
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import router from '@/router'
import { makeAuthenticatedRequest } from '@/services/authService'
export default {
  name: 'EditSubleaseModal',
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    sublease: {
      type: Object,
      required: true,
    },
    router: {
      type: Object,
      required: true,
    },
    updateListings: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      formData: {},
      MAPBOX_ACCESS_TOKEN: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '',
    }
  },
  watch: {
    sublease: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.formData = { ...newVal }
        }
      },
    },
    show(newVal) {
      if (newVal) {
        document.body.classList.add('overflow-hidden')
      } else {
        document.body.classList.remove('overflow-hidden')
      }
    },
  },
  methods: {
    async submitForm() {
      try {
        // Call makeAuthenticatedRequest with correct parameters
        const response = await makeAuthenticatedRequest('sublease/edit', this.formData, this.router)

        // Check if response exists and is valid
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log(data)
        this.updateListings(data)
        this.$emit('update:show', false)
      } catch (error) {
        console.error('Error updating sublease:', error)
      }
    },
    onRetrieve(result) {
      if (result) {
        this.formData.street_name = result.address || this.formData.street_name
        this.formData.city = result.city || this.formData.city
        this.formData.postal_code = result.postalCode || this.formData.postal_code
      }
    },
    closeModal() {
      this.$emit('update:show', false)
    },
  },
  beforeUnmount() {
    document.body.classList.remove('overflow-hidden')
  },
}
</script>
