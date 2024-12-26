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
  </form>
</template>

<script>
export default {
  name: 'CreateSubleaseModal',
  props: {
    formData: {
      type: Object,
      required: true,
    },
  },
}
</script>
