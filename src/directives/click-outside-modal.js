export default {
  beforeMount(el) {
    // Clean up any previous listeners from HMR
    if (el._clickOutside) {
      document.removeEventListener('click', el._clickOutside, true)
      delete el._clickOutside
    }
  },
  mounted(el, binding) {
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
  },

  unmounted(el) {
    document.removeEventListener('click', el._clickOutside, true)
    delete el._clickOutside
  },
}
