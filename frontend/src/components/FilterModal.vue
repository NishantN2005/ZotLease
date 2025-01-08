<template>
  <div
    v-if="showFilterModal"
    class="h-full w-80 bg-neutral-900 shadow-lg border-l border-stone-500 p-6 z-20"
  >
    <h1 class="font-bold text-xl text-center mb-4 text-white">Filter by:</h1>

    <!-- Use @submit.prevent + composition API's applyFilters method -->
    <form class="space-y-4 text-white" @submit.prevent="applyFilters">
      <!-- Gender -->
      <div>
        <label>Gender:</label>
        <div class="flex space-x-4">
          <!-- Male -->
          <label class="inline-flex items-center">
            <input type="radio" value="Male" v-model="filterform.gender" class="mr-1" />
            Male
          </label>
          <!-- Female -->
          <label class="inline-flex items-center">
            <input type="radio" value="Female" v-model="filterform.gender" class="mr-1" />
            Female
          </label>
          <!-- Other -->
          <label class="inline-flex items-center">
            <input type="radio" value="Other" v-model="filterform.gender" class="mr-1" />
            Other
          </label>
        </div>
      </div>

      <!-- Price Range -->
      <div>
        <label class="block mb-1 font-semibold">Price:</label>
        <div class="flex space-x-2">
          <input
            type="number"
            id="filterMinPrice"
            placeholder="0"
            v-model="filterform.minPrice"
            class="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            id="filterMaxPrice"
            placeholder="1200"
            v-model="filterform.maxPrice"
            class="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- Room Count -->
      <div>
        <label for="filterRoomCount" class="block mb-1 font-semibold">Room Count:</label>
        <input
          type="number"
          id="filterRoomCount"
          placeholder="3"
          v-model="filterform.roomCount"
          class="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        class="w-full py-2 rounded border border-stone-500 text-white font-semibold hover:bg-stone-500"
      >
        Apply Filters
      </button>
      <div
        @click="resetFilters"
        class="w-full py-2 rounded border border-stone-500 text-white font-semibold hover:stone-500 text-center"
      >
        Remove Filters
      </div>
    </form>
  </div>
</template>

<script>
import { makeAuthenticatedRequest } from '../services/authService.js'
import { useFilterStore } from '@/stores/filterStore'

export default {
  name: 'FilterModal',
  props: {
    filterform: {
      type: Object,
      required: true,
    },
    showFilterModal: {
      type: Boolean,
      required: true,
    },
    routerPass: {
      type: Object,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    toggleFilterModal: {
      type: Function,
      required: true,
    },
    resetFilters: {
      type: Function,
      required: true,
    },
  },

  // Composition API setup
  setup(props) {
    // Access your Pinia store
    const filterStore = useFilterStore()

    // Define the submit handler in setup
    const applyFilters = async () => {
      try {
        console.log(props.filterform)

        let response = await makeAuthenticatedRequest(
          'sublease/filter',
          props.filterform,
          props.routerPass,
          props.token,
        )
        // parse the JSON from the response
        const data = await response.json()
        const parsedSubleases = data.parsedSubleases

        // Store results in Pinia
        filterStore.setFilter(parsedSubleases)

        // Close the modal
        props.toggleFilterModal()
      } catch (err) {
        console.log(`Error applying filters: ${err}`)
      }
    }

    // Return anything you want to use in the template
    return { applyFilters }
  },
}
</script>
