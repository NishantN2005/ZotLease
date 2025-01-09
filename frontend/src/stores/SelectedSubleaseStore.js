import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useSelectedSubleaseStore = defineStore('selectedsublease', {
  state: () => {
    return {
      subleaseID: null,
      subletters: [],
      selectedSublet:null
    }
  },
  actions: {
    setSelectedSublease(subletter){
        this.selectedSublet = subletter;
    },
    addSubletter(subletter){
        this.subletters.push(subletter);
        if(this.selectedSublet === null){
            this.selectedSublet = subletter;
        }
    },
    setSelectedSubleaseID(subID){
        this.subleaseID = subID;
    }
  },
  getters: {},
})
