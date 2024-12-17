<template>
  <div class="dashboard">
    <h1>This is a Dashboard Page</h1>
    <LeafletMap />
  </div>
</template>

<script>
import LeafletMap from '@/components/icons/LeafletMap.vue'

export default {
  name: 'DashboardView',
  components: {
    LeafletMap,
  },
}
</script>

<style></style>
