<template>
  <div
    v-if="showFilterModal"
    class="fixed inset-0 flex items-center justify-center z-40 bg-white bg-opacity-50"
  >
    <div class="w-80 bg-white shadow-lg border border-stone-500 p-6 z-50">
      <h1 class="font-bold text-xl text-center mb-4 text-black">Filter by:</h1>

      <form class="space-y-4 text-black" @submit.prevent="applyFilters">
        <!-- Gender -->
        <div>
          <label class="text-black">Gender:</label>
          <div class="flex space-x-4">
            <label class="inline-flex items-center">
              <input type="radio" value="Male" v-model="filterform.gender" class="mr-1" />
              Male
            </label>
            <label class="inline-flex items-center">
              <input type="radio" value="Female" v-model="filterform.gender" class="mr-1" />
              Female
            </label>
            <label class="inline-flex items-center">
              <input type="radio" value="Other" v-model="filterform.gender" class="mr-1" />
              Other
            </label>
          </div>
        </div>

        <!-- Price Range Double Slider -->
        <div>
          <label class="block mb-1 font-semibold text-black pb-3">Price:</label>
          <Slider v-model="priceRange" :range="true" :min="0" :max="10000" :tooltips="false" />
          <div class="flex justify-between text-black text-sm mt-2">
            <span>Min: {{ priceRange[0] }}</span>
            <span>Max: {{ priceRange[1] }}</span>
          </div>
        </div>

        <!-- Room Count -->
        <div>
          <label for="filterRoomCount" class="block mb-1 font-semibold text-black"
            >Room Count:</label
          >
          <input
            type="number"
            id="filterRoomCount"
            placeholder="3"
            v-model="filterform.roomCount"
            class="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Start Date -->
        <div>
          <label for="filterStartDate" class="block mb-1 font-semibold text-black"
            >Start Date:</label
          >
          <input
            type="date"
            id="filterStartDate"
            v-model="filterform.startdate"
            class="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- End Date -->
        <div>
          <label for="filterEndDate" class="block mb-1 font-semibold text-black">End Date:</label>
          <input
            type="date"
            id="filterEndDate"
            v-model="filterform.enddate"
            class="border rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <!-- Buttons -->
        <button
          type="submit"
          class="w-full py-2 rounded border border-stone-500 text-black font-semibold hover:bg-gray-200"
        >
          Apply Filters
        </button>
        <button
          type="button"
          @click="resetFilters"
          class="w-full py-2 rounded border border-stone-500 text-black font-semibold hover:bg-gray-200"
        >
          Remove Filters
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import Slider from '@vueform/slider'
import '@vueform/slider/themes/default.css'
import { makeAuthenticatedRequest } from '../services/authService.js'
import { useFilterStore } from '@/stores/filterStore'

export default {
  name: 'FilterModal',
  components: {
    Slider,
  },
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
    toggleFilterModal: {
      type: Function,
      required: true,
    },
    resetFilters: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const filterStore = useFilterStore()

    const applyFilters = async () => {
      try {
        let response = await makeAuthenticatedRequest(
          'sublease/filter',
          props.filterform,
          props.routerPass,
        )
        const data = await response.json()
        const parsedSubleases = data.parsedSubleases
        filterStore.setFilter(parsedSubleases)
        props.toggleFilterModal()
      } catch (err) {
        console.log(`Error applying filters: ${err}`)
      }
    }

    // Create a reactive price range for double slider: [minPrice, maxPrice]
    const priceRange = ref([props.filterform.minPrice || 0, props.filterform.maxPrice || 10000])

    // Keep the filter form in sync with the slider values
    watch(priceRange, (newVal) => {
      props.filterform.minPrice = newVal[0]
      props.filterform.maxPrice = newVal[1]
    })

    return { applyFilters, priceRange }
  },
}
</script>

<style src="@vueform/slider/themes/default.css">
:root {
  --slider-connect-bg: #a594fe;
  --slider-bg: #252525;
  --slider-height: 20px;
  --slider-handle-width: 20px;
  --slider-handle-height: 20px;
  --slider-handle-bg: radial-gradient(circle, rgba(0, 0, 0, 1) 40%, rgba(165, 148, 254, 1) 60%);
  --slider-tooltip-bg: #a594fe;

  --slider-handle-ring-width: 3px;
  --slider-handle-ring-color: #a594fe30;
}
</style>

<style>
@import '@vueform/slider/themes/default.css';

/* Custom slider colors */
.slider-connect {
  background-color: #0064a4 !important;
}

.slider-handle {
  background-color: #0064a4 !important;
  border-color: #0064a4 !important;
}

.slider-horizontal .slider-handle:hover {
  box-shadow: 0 0 0 10px rgba(0, 100, 164, 0.1) !important;
}
</style>
