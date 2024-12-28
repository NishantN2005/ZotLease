<template>
  <div
    class="min-h-screen flex flex-col bg-gradient-to-br from-[#0061c4] via-[#ffbc00] to-[#0061c4]"
  >
    <header
      class="relative flex flex-col items-center justify-center h-screen text-center text-white px-6 md:px-12"
    >
      <div class="absolute inset-0 w-full h-full">
        <img
          src="/pvwstreet.png"
          alt="Middle Earth Tower"
          class="w-full h-full object-cover opacity-70 transform scale-110 animate-fadeIn"
        />
      </div>

      <div
        class="absolute inset-0 bg-gradient-to-b from-transparent via-[#0061c4]/60 to-[#0061c4] blur-xl"
      ></div>

      <div class="relative z-10 max-w-4xl px-4 md:px-8 text-center animate-slideInUp">
        <h1
          class="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-8 text-white p-2 relative inline-block"
        >
          YOUR DREAM SPACE
          <span
            class="absolute inset-x-0 bottom-0 h-2 bg-white transform scale-x-0 origin-left transition-all duration-500 ease-in-out hover:scale-x-100"
          ></span>
        </h1>
        <p class="text-lg md:text-2xl text-white/90 leading-relaxed mb-12 animate-fadeInUp">
          Explore endless possibilities to find your perfect dream space with just a few clicks.
        </p>
        <router-link to="/login">
          <button
            class="px-12 py-4 bg-gradient-to-r from-[#ffbc00] to-[#0061c4] text-white text-xl font-semibold rounded-lg shadow-2xl transform hover:scale-105 transition duration-300 ease-in-out"
          >
            Explore Now
          </button>
        </router-link>
      </div>
    </header>

    <section class="py-16 bg-[#f3f4f7] text-center">
      <h2 class="text-4xl font-bold text-[#0061c4] mb-10">Why Choose Us?</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 px-6 md:px-12">
        <div
          class="p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105"
        >
          <h3 class="text-xl font-bold mb-4 text-[#0061c4]">Seamless Experience</h3>
          <p class="text-gray-700">
            We ensure a smooth, hassle-free journey to finding your dream space.
          </p>
        </div>
        <div
          class="p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105"
        >
          <h3 class="text-xl font-bold mb-4 text-[#0061c4]">Tailored Choices</h3>
          <p class="text-gray-700">
            Our platform offers personalized recommendations to fit your unique style.
          </p>
        </div>
        <div
          class="p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transition duration-300 ease-in-out transform hover:scale-105"
        >
          <h3 class="text-xl font-bold mb-4 text-[#0061c4]">Instant Access</h3>
          <p class="text-gray-700">Get access to hundreds of options with just a few clicks.</p>
        </div>
      </div>
    </section>

    <footer class="bg-[#003f7d] py-8 text-center text-white">
      <p class="text-sm md:text-base opacity-80">© 2024 ZotLease. All rights reserved.</p>
    </footer>
  </div>
</template>

<style>
@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(50px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Fade-in and Slide-up Effects */
.animate-fadeIn {
  animation: fadeIn 1.5s ease-in-out forwards;
}

.animate-fadeInUp {
  animation: fadeInUp 1s ease-in-out forwards;
}

.animate-slideInUp {
  animation: slideInUp 1s ease-in-out forwards;
}

/* Add Box Shadow on Hover */
.hover\:scale-105:hover {
  transform: scale(1.05);
}

.hover\:shadow-2xl:hover {
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

/* Responsive Styling */
@media (max-width: 640px) {
  .bg-clip-text {
    background-clip: text;
    -webkit-background-clip: text;
  }

  .text-xl {
    font-size: 1.25rem;
  }

  .text-lg {
    font-size: 1.125rem;
  }

  .text-4xl {
    font-size: 2.5rem;
  }

  .text-5xl {
    font-size: 3rem;
  }

  .text-6xl {
    font-size: 3.75rem;
  }

  .text-7xl {
    font-size: 4rem;
  }

  .bg-gradient-to-r {
    background: linear-gradient(to right, #f8d63e, #f66c63);
  }
}
</style>
