<script setup>
import { computed } from 'vue';

const props = defineProps({ section: { type: Object, required: true } });
const style = computed(() => props.section.config?.style || {});
const type = computed(() => style.value.divider_type || '');
const position = computed(() => style.value.divider_position || 'bottom');
const showTop = computed(() => type.value && ['top', 'both'].includes(position.value));
const showBottom = computed(() => type.value && ['bottom', 'both'].includes(position.value));
const paths = {
  wave: 'M0,42 C10,18 18,18 28,42 C38,66 48,66 58,42 C68,18 78,18 88,42 C94,56 98,60 100,60 L100,100 L0,100 Z',
  curve: 'M0,52 C25,12 75,12 100,52 L100,100 L0,100 Z',
  mountain: 'M0,72 L12,46 L22,66 L36,22 L50,66 L62,38 L74,70 L88,30 L100,54 L100,100 L0,100 Z',
  organic: 'M0,56 C12,22 24,38 34,60 C45,82 55,70 64,42 C74,12 88,34 100,64 L100,100 L0,100 Z',
  tilt: 'M0,70 L100,16 L100,100 L0,100 Z',
  zigzag: 'M0,58 L5,30 L10,58 L15,30 L20,58 L25,30 L30,58 L35,30 L40,58 L45,30 L50,58 L55,30 L60,58 L65,30 L70,58 L75,30 L80,58 L85,30 L90,58 L95,30 L100,58 L100,100 L0,100 Z'
};
const dividerPath = computed(() => paths[type.value] || paths.curve);
</script>

<template>
  <svg v-if="showTop" aria-hidden="true" class="section-divider section-divider-top" :class="`divider-${type}`" viewBox="0 0 100 100" preserveAspectRatio="none">
    <path :d="dividerPath"></path>
  </svg>
  <svg v-if="showBottom" aria-hidden="true" class="section-divider section-divider-bottom" :class="`divider-${type}`" viewBox="0 0 100 100" preserveAspectRatio="none">
    <path :d="dividerPath"></path>
  </svg>
</template>
