<template>
  <form class="space-y-4 p-2 font-Sriracha">
    <!-- Wrap your address inputs in <mapbox-address-autofill> -->
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
          :class="[
            'mr-5 mt-1 border rounded-lg p-1 w-[70%]',
            incorrectFields && incorrectFields.length > 0 && incorrectFields.includes('street_name') ? 'border-red-500' : 'border-uciblue'
          ]"
        />
        <input
          v-model="formData.room"
          type="text"
          name="address-line2"
          id="room"
          placeholder="Room/Unit"
          autocomplete="address-line2"
          :class="[
            'mr-5 border rounded-lg p-1 w-[20%]',
            incorrectFields && incorrectFields.length > 0 && incorrectFields.includes('room') ? 'border-red-500' : 'border-uciblue'
          ]"
        />

        <br />

        <input
          v-model="formData.city"
          type="text"
          name="address-level2"
          id="city"
          placeholder="City"
          autocomplete="address-level2"
          :class="[
            'mr-5 mt-2 border rounded-lg p-1 w-[45%]',
            incorrectFields && incorrectFields.length > 0 && incorrectFields.includes('city') ? 'border-red-500' : 'border-uciblue'
          ]"
        />

        <input
          v-model="formData.postal_code"
          type="text"
          name="postal-code"
          id="postal"
          placeholder="Postal / Zip Code"
          autocomplete="postal-code"
          :class="[
            'mr-5 mt-2 border rounded-lg p-1 w-[45%]',
            incorrectFields && incorrectFields.length > 0 && incorrectFields.includes('postal_code') ? 'border-red-500' : 'border-uciblue'
          ]"
        />
      </div>

      <div class="flex flex-wrap">
        <!-- New State Field -->
        <input
          v-model="formData.state"
          type="text"
          name="address-level1"
          id="state"
          placeholder="State"
          autocomplete="address-level1"
          :class="[
            'mr-5 mt-2 border rounded-lg p-1 w-[45%]',
            incorrectFields && incorrectFields.length > 0 && incorrectFields.includes('state') ? 'border-red-500' : 'border-uciblue'
          ]"
        />
        <!-- New Country Field -->
        <input
          v-model="formData.country"
          type="text"
          name="country"
          id="country"
          placeholder="Country"
          autocomplete="country-name"
          :class="[
            'mr-5 mt-2 border rounded-lg p-1 w-[45%]',
            incorrectFields && incorrectFields.length > 0 && incorrectFields.includes('country') ? 'border-red-500' : 'border-uciblue'
          ]"
        />
      </div>
    </mapbox-address-autofill>

    <div>
      <label>Gender:</label>
      <div class="flex flex-col space-y-2 mt-1 w-[93%]">
        <!-- Male -->
        <label :class="[
          'inline-flex items-center border rounded-lg p-1',
          incorrectFields && incorrectFields.length > 0 && incorrectFields.includes('gender') ? 'border-red-500' : 'border-uciblue'
        ]">
          <input type="radio" value="Male" v-model="formData.gender" class="mr-1" />
          Male
        </label>

        <!-- Female -->
        <label :class="[
          'inline-flex items-center border rounded-lg p-1',
          incorrectFields && incorrectFields.length > 0 && incorrectFields.includes('gender') ? 'border-red-500' : 'border-uciblue'
        ]">
          <input type="radio" value="Female" v-model="formData.gender" class="mr-1" />
          Female
        </label>

        <!-- Other -->
        <label :class="[
          'inline-flex items-center border rounded-lg p-1',
          incorrectFields && incorrectFields.length > 0 && incorrectFields.includes('gender') ? 'border-red-500' : 'border-uciblue'
        ]">
          <input type="radio" value="Other" v-model="formData.gender" class="mr-1" />
          Other
        </label>
      </div>
    </div>

    <div class="flex flex-col space-y-2 w-[93%]">
      <div class="flex items-center space-x-2">
        <div class="flex items-center space-x-1 text-gray-500 text-sm">
          <div
            class="w-4 h-4 rounded-full bg-gray-300 text-xs flex items-center justify-center text-white"
          >
            i
          </div>
          <span class="text-xs text-gray-500">Optional</span>
        </div>
      </div>

      <!-- Input with prefix -->
      <div class="flex items-center space-x-4">
        <div :class="[
          'flex w-full items-center border rounded-lg overflow-hidden',
          incorrectFields && incorrectFields.length > 0 && incorrectFields.includes('insta') ? 'border-red-500' : 'border-uciblue'
        ]">
          <span class="bg-gray-100 px-3 py-2 text-gray-600 text-sm select-none">
            https://instagram.com/
          </span>
          <input
            v-model="formData.insta"
            id="insta"
            name="insta"
            placeholder="your_username"
            class="flex-1 p-2 text-gray-700 focus:outline-none"
          />
        </div>
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
          :class="[
            'w-[93%] border rounded-lg p-1 mt-1',
            incorrectFields && incorrectFields.length > 0 && incorrectFields.includes('price') ? 'border-red-500' : 'border-uciblue'
          ]"
        />
      </div>

      <div>
        <label>Room Information:</label>
        <br />
        <input
          v-model="formData.roomCount"
          type="number"
          name="roomCount"
          id="roomCount"
          placeholder="Number of Rooms"
          :class="[
            'mr-2 border rounded-lg p-1 w-[45%] mt-1',
            incorrectFields && incorrectFields.length > 0 && incorrectFields.includes('roomCount') ? 'border-red-500' : 'border-uciblue'
          ]"
        />

        <input
          v-model="formData.bathroomCount"
          type="number"
          name="bathroomCount"
          id="bathroomCount"
          placeholder="Number of Bathrooms"
          :class="[
            'border rounded-lg p-1 w-[46%]',
            incorrectFields && incorrectFields.length > 0 && incorrectFields.includes('bathroomCount') ? 'border-red-500' : 'border-uciblue'
          ]"
        />
      </div>
    </div>

    <div class="flex flex-col space-y-2 w-[93%]">
      <!-- Start Term -->
      <div class="flex items-center space-x-4">
        <label for="startTerm" class="w-1/4">Start Term:</label>
        <input
          v-model="formData.startTerm"
          type="date"
          name="startTerm"
          id="startTerm"
          placeholder="06/16/25"
          :class="[
            'text-gray-500 w-[72%] p-1 border rounded-lg',
            incorrectFields && incorrectFields.length > 0 && incorrectFields.includes('startTerm') ? 'border-red-500' : 'border-uciblue'
          ]"
        />
      </div>

      <!-- End Term -->
      <div class="flex items-center space-x-4">
        <label for="endTerm" class="w-1/4">End Term:</label>
        <input
          v-model="formData.endTerm"
          type="date"
          name="endTerm"
          id="endTerm"
          placeholder="08/24/25"
          :class="[
            'text-gray-500 w-[72%] p-1 border rounded-lg',
            incorrectFields && incorrectFields.length > 0 && incorrectFields.includes('endTerm') ? 'border-red-500' : 'border-uciblue'
          ]"
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
        :class="[
          'p-1 border rounded-lg',
          incorrectFields && incorrectFields.length > 0 && incorrectFields.includes('description') ? 'border-red-500' : 'border-uciblue'
        ]"
      />
    </div>

    <div class="mb-4">
      <label for="leasePdf" class="block mb-1 font-semibold">Upload Photos:</label>
      <input
        id="leasePdf"
        type="file"
        @change="handleFileChange"
        :class="[
          'block w-full text-sm text-gray-900 rounded cursor-pointer focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100',
          incorrectFields && incorrectFields.length > 0 && incorrectFields.includes('files') ? 'border border-red-500 rounded' : ''
        ]"
      />
    </div>
  </form>

  <!-- List of Uploaded Files -->
  <ul class="mt-4 space-y-2 border">
    <li
      v-for="(file, index) in filesRef"
      :key="index"
      class="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200"
    >
      <!-- File Name -->
      <span class="text-sm text-gray-700">
        {{ file.name }}
      </span>
      <!-- Remove Button (uncomment if needed) -->
      <!-- <button
          @click="removeFile(index)"
          class="text-red-500 hover:text-red-700 text-sm font-semibold"
      >
          Remove
      </button> -->
    </li>
  </ul>
</template>

<script>
import { MapboxAddressAutofill } from '@mapbox/search-js-web'
import { MAPBOX_ACCESS_TOKEN } from '../../constants'
export default {
  name: 'CreateSubleaseModal',
  props: {
    formData: {
      type: Object,
      required: true,
    },
    handleFileChange: {
      type: Function,
      required: true,
    },
    filesRef: {
      type: Object,
      required: true,
    },
    incorrectFields: {
      type: Array,
      required: true,
    },
  },
  setup() {
    return { MAPBOX_ACCESS_TOKEN }
  },
  methods: {
    onRetrieve(result) {},
  },
}
</script>
