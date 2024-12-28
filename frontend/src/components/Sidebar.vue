<template>
    <div class="bg-neutral-900 w-[4%] h-screen flex flex-col justify-between text-stone-300 py-4">
      <!-- Top Section: Profile Picture -->
      <div class="flex flex-col items-center space-y-6 ">
        <button class="w-10 h-10 border border-stone-500 rounded-full flex items-center justify-center">
          <!-- Font Awesome Icon for Profile Picture -->
          <i class="fas fa-user text-white text-xl"></i>
        </button>
        <!-- Middle Section: Buttons -->
        <div class="flex flex-col justify-start">
            <button 
            @click="turnOnModal"
            class="border-y border-stone-500 hover:bg-stone-500 text-white py-2 px-4 flex items-center justify-center space-x-2">
            <i class="fas fa-plus"></i>
            </button>
            <button 
            @click="toggleFilterModal"
            class="hover:bg-stone-500 text-white py-2 px-4 flex items-center justify-center space-x-2">
            <i class="fas fa-filter"></i>
            </button>
            <button 
            class="border-y border-stone-500 hover:bg-stone-500 text-white py-2 px-4 flex items-center justify-center space-x-2">
            <i class="fas fa-comments"></i>
            </button>
        </div>
      </div>
  
  
      <!-- Bottom Section: Logout Button -->
      <div>
        <button
          @click="Logout"
          class="w-full border-y border-stone-500 hover:bg-stone-500 text-white py-2 px-4 flex items-center justify-center space-x-2">
          <i class="fas fa-sign-out-alt"></i>
        </button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'Sidebar',
    props: {
      Logout:{
        type: Function,
        required: true
      },
      turnOnModal:{
        type: Function,
        required: true
      },
      toggleFilterModal:{
        type: Function,
        required: true
      }
    },
    methods: {
        Logout() {
        this.Logout(); // This calls the prop passed to the component.
        },
        turnOnModal(){
            this.turnOnModal();
        },
        toggleFilterModal(){
            this.toggleFilterModal();
        }
    }
  };
  </script>
  
  <style>
  /* Optional: Add custom styles here if needed */
  </style>
  