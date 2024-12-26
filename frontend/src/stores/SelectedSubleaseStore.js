import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useSelectedSubleaseStore = defineStore('selectedsublease', {
  state: () => {
    return {
      subleaseID: null,
      fName: null,
      lName: null,
      listerID: null,
      price: null,
      gender: null,
      roomCount: null,
      bathroomCount: null,
      street_name: null,
      city: null,
      room: null,
      postal_code: null,
      startTerm: null,
      endTerm: null,
      description: null,
    }
  },
  persist: true,
  actions: {
    setSelectedSublease(subID, first_name, last_name, lister, price, gender, roomCount, bathroomCount, street_name,city, room, postal_code, startTerm, endTerm ,description){
        this.subleaseID = subID;
        this.fName = first_name;
        this.lName = last_name;
        this.listerID = lister;
        this.price = price;
        this.gender = gender;
        this.roomCount = roomCount;
        this.bathroomCount = bathroomCount;
        this.street_name = street_name;
        this.city = city;
        this.room = room;
        this.postal_code = postal_code;
        this.startTerm = startTerm;
        this.endTerm = endTerm;
        this.description = description;
    }
  },
  getters: {},
})
