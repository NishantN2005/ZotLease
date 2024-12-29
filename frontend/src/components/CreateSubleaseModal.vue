<template>
  <form class="space-y-4 p-2">
    <div>
      <label>Address:</label>
      <br />
      <input
        v-model="formData.street_name"
        type="text"
        name="address"
        id="address"
        placeholder="Street Address"
        class="mr-5 mt-1 border border-uciblue rounded-lg p-1 w-[70%]"
      />
      <input
        v-model="formData.room"
        type="text"
        name="room"
        id="room"
        placeholder="Room/Unit"
        class="mr-5 border border-uciblue rounded-lg p-1 w-[20%]"
      />

      <br />

      <input
        v-model="formData.city"
        type="text"
        name="city"
        id="city"
        placeholder="City"
        class="mr-5 mt-2 border border-uciblue rounded-lg p-1 w-[45%]"
      />

      <input
        v-model="formData.postal_code"
        type="text"
        name="postal"
        id="postal"
        placeholder="Postal / Zip Code"
        class="mr-5 mt-2 border border-uciblue rounded-lg p-1 w-[45%]"
      />
    </div>

    <div>
      <label>Gender:</label>
      <div class="flex flex-col space-y-2 mt-1 w-[93%]">
        <!-- Male -->
        <label class="inline-flex items-center border border-uciblue rounded-lg p-1">
          <input type="radio" value="Male" v-model="formData.gender" class="mr-1" />
          Male
        </label>

        <!-- Female -->
        <label class="inline-flex items-center border border-uciblue rounded-lg p-1">
          <input type="radio" value="Female" v-model="formData.gender" class="mr-1" />
          Female
        </label>

        <!-- Other -->
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
          v-model="formData.roomCount"
          type="number"
          name="roomCount"
          id="roomCount"
          placeholder="Number of Rooms"
          class="mr-2 border border-uciblue rounded-lg p-1 w-[45%] mt-1"
        />

        <input
          v-model="formData.bathroomCount"
          type="number"
          name="bathroomCount"
          id="bathroomCount"
          placeholder="Number of Bathrooms"
          class="border border-uciblue rounded-lg p-1 w-[46%]"
        />
      </div>
    </div>

    <div></div>

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
          class="text-gray-500 w-[72%] p-1 border border-uciblue rounded-lg"
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

    <div class="mb-4">
      <label for="leasePdf" class="block mb-1 font-semibold">Upload Photos:</label>
      <input
        id="leasePdf"
        type="file"
        accept="image/png"
        @change="handleFileChange"
        class="block w-full text-sm text-gray-900 rounded cursor-pointer focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      <p class="mt-1 text-sm text-gray-600">Only PNG files are accepted.</p>
      <!-- List of Uploaded Files -->
    </div>
  </form>

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

      <!-- Remove Button -->
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
  },
}
</script>
