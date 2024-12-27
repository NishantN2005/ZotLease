<template>
  <form class="space-y-5">
    <div>
      <label>Street Name: </label>
      <input
        v-model="formData.street_name"
        type="text"
        name="address"
        id="address"
        placeholder="1234 Arroyo Dr, CA 92617"
        class="mr-5"
      />
      <label>Room/Unit: </label>
      <input
        v-model="formData.room"
        type="text"
        name="room"
        id="room"
        placeholder="3B"
        class="mr-5"
      />

      <label>City: </label>
      <input
        v-model="formData.city"
        type="text"
        name="city"
        id="city"
        placeholder="Irvine"
        class="mr-5"
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
      <label>Gender:</label>
      <div class="flex space-x-4">
        <!-- Male -->
        <label class="inline-flex items-center">
          <input type="radio" value="Male" v-model="formData.gender" class="mr-1" />
          Male
        </label>

        <!-- Female -->
        <label class="inline-flex items-center">
          <input type="radio" value="Female" v-model="formData.gender" class="mr-1" />
          Female
        </label>

        <!-- Other -->
        <label class="inline-flex items-center">
          <input type="radio" value="Other" v-model="formData.gender" class="mr-1" />
          Other
        </label>
      </div>

      <label>Price: </label>
      <input v-model="formData.price" type="number" name="price" id="price" placeholder="1200" />
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

    <div></div>

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

    <div class="mb-4">
        <label for="leasePdf" class="block mb-1 font-semibold">Upload Photos:</label>
        <input
        id="leasePdf"
        type="file"
        accept="image/png"
        @change="handleFileChange"
        class="block w-full text-sm text-gray-900  rounded cursor-pointer
                focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full
                file:border-0 file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <p class="mt-1 text-sm text-gray-600">
        Only PNG files are accepted.
        </p>
        <!-- List of Uploaded Files -->
    </div>
  </form>

  <ul class="mt-4 space-y-2 border border-2">
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
    handleFileChange:{
        type: Function,
        required: true
    },
    filesRef:{
        type: Object,
        required: true
    }
  },
}
</script>
