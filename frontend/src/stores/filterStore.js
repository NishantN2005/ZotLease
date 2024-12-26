import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useFilterStore = defineStore('filter', {
  state: () => {
    return {
      acceptedSubleases : [],
      isFiltered: false
    }
  },
  actions: {
    setFilter(subleases){
        console.log('Inside state being called')
        this.acceptedSubleases = subleases;
        this.isFiltered = true;
    }
  },
  getters: {},
})
