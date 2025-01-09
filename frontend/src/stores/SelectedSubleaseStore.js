import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { add } from '@amcharts/amcharts5/.internal/core/util/Time';

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
