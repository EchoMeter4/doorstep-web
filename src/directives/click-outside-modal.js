export default {
  beforeMount(el) {
    // Clean up any previous listeners from HMR
    if (el._clickOutside) {
      document.removeEventListener('click', el._clickOutside, true)
      delete el._clickOutside
    }
    if (el._closeOnEscape) {
      document.removeEventListener('keydown', el._closeOnEscape, true)
      delete el._closeOnEscape
    }
  },
  mounted(el, binding) {
    el._closeOnEscape = function (event) {
      if (event.key === 'Escape') {
        binding.value(event)
      }
    }

    el._clickOutside = function (event) {
      if (el === event.target || el.contains(event.target)) {
        return
      }

      let currentElement = event.target
      while (currentElement) {
        let checks = [
          currentElement.hasAttribute && currentElement.hasAttribute('data-click-outside-ignore'),

          currentElement.classList && currentElement.classList.contains('mx-datepicker-main'),
        ]

        if (checks.includes(true)) {
          return
        }

        currentElement = currentElement.parentElement
      }

      binding.value(event)
    }

    document.addEventListener('click', el._clickOutside, true)
    document.addEventListener('keydown', el._closeOnEscape, true)
  },

  unmounted(el) {
    document.removeEventListener('click', el._clickOutside, true)
    delete el._clickOutside
    document.removeEventListener('keydown', el._closeOnEscape, true)
    delete el._closeOnEscape
  },
}
