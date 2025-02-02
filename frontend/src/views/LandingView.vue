<template>
  <div class="min-h-screen flex flex-col bg-white">
    <!-- Hero Section -->
    <header
      class="relative flex flex-col items-center justify-center h-screen text-center text-white overflow-hidden"
    >
      <!-- Background Image with Overlay -->
      <div class="absolute inset-0 w-full h-full">
        <img
          src="/newback.jpg"
          alt="Modern Architecture"
          class="w-full h-full object-cover transform scale-105 animate-fadeIn"
        />
        <div
          class="absolute inset-0 bg-gradient-to-t from-[#003f7d] via-[#003f7d]/40 to-transparent"
        ></div>
      </div>

      <!-- Hero Content -->
      <div class="relative z-10 max-w-4xl px-4 md:px-8 animate-slideInUp">
        <h1 class="text-5xl md:text-6xl font-extrabold mb-6 text-white font-[Inter] tracking-tight">
          Redefine Urban Living
        </h1>

        <p
          class="text-xl md:text-2xl text-white/90 leading-relaxed mb-8 max-w-2xl mx-auto font-[Inter]"
        >
          Discover meticulously selected spaces in iconic modern buildings
        </p>

        <router-link to="/login">
          <button
            class="px-8 py-3.5 bg-white text-[#003f7d] text-lg font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:bg-opacity-95 flex items-center gap-2 mx-auto"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM6.75 9.25a.75.75 0 000 1.5h4.59l-2.1 1.95a.75.75 0 001.02 1.1l3.5-3.25a.75.75 0 000-1.1l-3.5-3.25a.75.75 0 10-1.02 1.1l2.1 1.95H6.75z"
                clip-rule="evenodd"
              />
            </svg>
            Explore Listings
          </button>
        </router-link>
      </div>

      <!-- Scrolling Indicator -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div
          class="w-8 h-14 rounded-3xl border-2 border-white/40 flex items-start justify-center p-1"
        >
          <div class="w-2 h-2 bg-white/80 rounded-full animate-scrollIndicator"></div>
        </div>
      </div>
    </header>

    <!-- Features Section -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-6 md:px-12">
        <h2 class="text-3xl md:text-4xl font-bold text-[#003f7d] mb-14 text-center">
          Why ZotLease?
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div
            class="p-6 bg-white rounded-xl border border-gray-100 hover:border-[#003f7d]/20 transition-all duration-300 group"
          >
            <div class="w-12 h-12 bg-[#003f7d]/10 rounded-lg mb-6 flex items-center justify-center">
              <svg
                class="w-6 h-6 text-[#003f7d]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-3 text-gray-900">Smart Matching</h3>
            <p class="text-gray-600 leading-relaxed">
              AI-powered recommendations tailored to your lifestyle and preferences
            </p>
          </div>

          <div
            class="p-6 bg-white rounded-xl border border-gray-100 hover:border-[#003f7d]/20 transition-all duration-300 group"
          >
            <div class="w-12 h-12 bg-[#003f7d]/10 rounded-lg mb-6 flex items-center justify-center">
              <svg
                class="w-6 h-6 text-[#003f7d]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-3 text-gray-900">Verified Spaces</h3>
            <p class="text-gray-600 leading-relaxed">
              Professionally inspected properties with quality assurance
            </p>
          </div>

          <div
            class="p-6 bg-white rounded-xl border border-gray-100 hover:border-[#003f7d]/20 transition-all duration-300 group"
          >
            <div class="w-12 h-12 bg-[#003f7d]/10 rounded-lg mb-6 flex items-center justify-center">
              <svg
                class="w-6 h-6 text-[#003f7d]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-3 text-gray-900">Flexible Terms</h3>
            <p class="text-gray-600 leading-relaxed">
              Customizable lease durations with transparent pricing
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-[#003f7d] py-8 text-center text-white">
      <p class="text-sm md:text-base opacity-80">© 2024 ZotLease. All rights reserved.</p>
    </footer>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Bubbly+Sans&display=swap');

:root {
  font-family: 'Bubbly Sans', sans-serif;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scrollIndicator {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(10px);
  }
  100% {
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 1s ease-out forwards;
}

.animate-slideInUp {
  animation: slideInUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.animate-scrollIndicator {
  animation: scrollIndicator 1.5s infinite;
}

/* Custom Utilities */
.tracking-tight {
  letter-spacing: -0.03em;
}

.shadow-sm {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.hover\:shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
</style>
