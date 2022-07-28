<template>
  <div
    v-if="withdrawId == null || userErrorMessage != null"
    class="min-h-screen grid place-items-center text-center"
  >
    <div>
      Enter your LNURLw withdraw ID<br>

      <div class="m-5 text-center">
        <form
          @submit="router.push({ ...route, params: { ...route.params, withdrawId: inputWithdrawId } })"
        >
          <input
            v-model="inputWithdrawId"
            type="text"
            class="w-full border my-1 px-3 py-2 focus:outline-none"
          >
          <ButtonDefault
            type="submit"
          >
            Create Codes
          </ButtonDefault>
        </form>
      </div>

      <small>(Needs to be from <LinkDefault :href="LNURL_ORIGIN" target="_blank">{{ LNURL_ORIGIN }}</LinkDefault>)</small>
      <p
        v-if="userErrorMessage != null"
        class="text-red-500 text-align-center"
      >
        {{ userErrorMessage }}
      </p>
    </div>
  </div>
  <div
    v-for="userWarning in userWarnings"
    :key="userWarning"
    class="bg-yellow-300 p-2 mb-1 print:hidden"
  >
    {{ userWarning }}
  </div>
  <div
    v-if="lnurlDescriptionMessage != null"
    class="p-2 mb-1 border-b print:hidden"
  >
    Description that will be displayed in the wallet app:<br>
    <strong v-if="lnurlDescriptionMessage !== ''">{{ lnurlDescriptionMessage }}</strong>
    <span v-else>(empty)</span>
  </div>
  <div
    v-if="cards.length > 0"
    class="relative w-[210mm] p-[15mm]"
  >
    <div
      v-for="card in cards"
      :key="card.url"
      class="relative break-inside-avoid w-[90mm] h-[55mm] float-left group"
    >
      <div class="group-odd:left-0 group-even:right-0 absolute border-l-[0.5px] opacity-50 h-3 -top-4" />
      <div class="group-odd:left-0 group-even:right-0 absolute border-l-[0.5px] opacity-50 h-3 -bottom-4" />
      <div class="hidden group-first:block right-0 absolute border-l-[0.5px] opacity-50 h-3 -top-4" />
      <div class="hidden group-last:block left-0 absolute border-l-[0.5px] opacity-50 h-3 -bottom-4" />

      <div class="group-odd:-left-4 group-even:-right-4 absolute border-t-[0.5px] opacity-50 w-3 top-0" />
      <div class="group-odd:-left-4 group-even:-right-4 absolute border-t-[0.5px] opacity-50 w-3 bottom-0" />      
      <a
        v-if="card.url != ''"
        :href="card.url"
      >
        <div class="absolute grid place-items-center w-full h-full">
          <!-- eslint-disable vue/no-v-html -->
          <div
            v-html="card.qrCodeSvg"
          />
          <!-- eslint-enable vue/no-v-html -->
        </div>
        <div class="absolute grid place-items-center w-full h-full pointer-events-none">
          
          <svg
            class="h-[14mm]"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <linearGradient
              id="SVGID_2_"
              gradientUnits="userSpaceOnUse"
              x1="30.2407"
              y1="150.1237"
              x2="130.7928"
              y2="49.5716"
              gradientTransform="matrix(0.638001, 0, 0, 0.638001, -4.83758, -2.539381)"
            >
              <stop offset="0.0307" style="stop-color: #6B3D91;" />
              <stop offset="0.3219" style="stop-color: #AE278F;" />
              <stop offset="0.6364" style="stop-color: #E70075;" />
              <stop offset="0.6973" style="stop-color: #EC006C;" />
              <stop offset="0.7983" style="stop-color: #F80152;" />
              <stop offset="0.849" style="stop-color: #FF0143;" />
              <stop offset="0.8838" style="stop-color: #FF0B39;" />
              <stop offset="0.9433" style="stop-color: #FF271F;" />
              <stop offset="1" style="stop-color: #FF4700;" />
            </linearGradient>
            <path
              style="fill: url(#SVGID_2_); fill-rule: nonzero; stroke: #fff; paint-order: stroke; stroke-width: 16px;"
              d="M 51.753 35.166 C 51.728 37.122 52.669 38.579 54.713 39.608 C 56.797 40.746 60.089 41.947 64.673 43.284 C 69.335 44.752 73.244 46.098 76.255 47.444 C 79.286 48.798 81.956 50.822 84.15 53.397 C 86.415 56.006 87.545 59.49 87.545 63.749 C 87.545 70.645 84.911 76.069 79.693 79.83 C 74.599 83.492 67.359 85.372 58.069 85.441 C 58.006 85.441 36.377 85.441 36.377 85.441 C 35.42 85.428 34.502 85.038 33.887 84.423 C 33.271 83.807 32.868 82.89 32.868 81.932 C 32.868 80.974 33.271 80.057 33.887 79.441 C 34.502 78.826 35.42 78.436 36.377 78.423 L 49.01 78.423 C 49.838 78.436 50.516 78.124 51.049 77.591 C 51.582 77.058 51.881 76.381 51.881 75.552 C 51.881 74.723 51.582 74.046 51.049 73.513 C 50.516 72.98 49.838 72.668 49.01 72.681 L 23.936 72.681 C 22.979 72.668 22.061 72.278 21.446 71.663 C 20.83 71.047 20.427 70.13 20.427 69.172 C 20.427 68.214 20.83 67.297 21.446 66.681 C 22.061 66.066 22.979 65.676 23.936 65.663 C 23.936 65.663 35.356 65.647 46.776 65.623 C 52.486 65.611 58.196 65.597 62.479 65.582 C 64.62 65.575 66.404 65.567 67.652 65.559 C 68.277 65.555 68.767 65.551 69.1 65.547 C 69.267 65.546 69.394 65.544 69.479 65.542 C 69.52 65.54 69.548 65.54 69.567 65.539 C 70.207 65.399 70.711 65.053 71.106 64.555 C 71.506 64.052 71.723 63.47 71.723 62.792 C 71.723 61.963 71.424 61.286 70.891 60.753 C 70.358 60.22 69.68 59.908 68.852 59.921 L 41.162 59.921 C 40.205 59.908 39.287 59.518 38.672 58.903 C 38.057 58.287 37.653 57.37 37.653 56.412 C 37.653 55.454 38.057 54.537 38.672 53.921 C 39.287 53.306 40.199 52.916 41.157 52.903 C 41.157 52.903 42.05 52.887 42.935 52.871 C 43.377 52.863 43.818 52.855 44.144 52.849 C 44.307 52.846 44.441 52.844 44.533 52.842 C 44.579 52.841 44.613 52.84 44.636 52.84 C 44.641 52.84 44.646 52.84 44.65 52.84 C 45.417 52.758 46.04 52.42 46.527 51.896 C 47.017 51.37 47.287 50.735 47.287 49.968 C 47.287 49.139 46.989 48.462 46.455 47.929 C 45.922 47.396 45.245 47.084 44.416 47.097 L 17.492 47.097 C 16.535 47.084 15.617 46.694 15.002 46.079 C 14.387 45.463 13.983 44.546 13.983 43.588 C 13.983 42.63 14.387 41.713 15.002 41.097 C 15.617 40.482 16.534 40.092 17.491 40.079 L 33.982 40.015 C 34.616 39.872 35.124 39.536 35.54 39.024 C 35.955 38.513 36.186 37.916 36.186 37.208 C 36.186 36.467 35.956 35.857 35.527 35.348 C 35.099 34.839 34.548 34.504 33.837 34.396 L 33.57 34.356 L 33.57 34.337 L 29.359 34.337 C 28.402 34.324 27.484 33.934 26.869 33.319 C 26.253 32.703 25.85 31.786 25.85 30.828 C 25.85 29.87 26.253 28.953 26.869 28.337 C 27.484 27.722 28.402 27.332 29.359 27.319 L 47.096 27.319 C 47.924 27.332 48.602 27.02 49.135 26.487 C 49.668 25.954 49.967 25.277 49.967 24.448 C 49.967 23.71 49.724 23.103 49.28 22.592 C 48.836 22.081 48.266 21.745 47.554 21.636 L 47.287 21.596 L 47.287 21.577 L 42.63 21.577 C 41.672 21.564 40.755 21.174 40.139 20.559 C 39.524 19.943 39.121 19.026 39.121 18.068 C 39.121 17.11 39.524 16.193 40.139 15.577 C 40.755 14.962 41.672 14.572 42.63 14.559 L 63.046 14.559 C 63.396 14.562 63.733 14.629 64.063 14.751 C 68.589 14.82 72.804 15.331 76.717 16.356 C 80.825 17.449 84.135 18.945 86.464 20.751 C 88.488 22.338 89.523 24.442 89.523 26.936 C 89.523 28.904 88.908 30.611 87.659 32.058 C 86.404 33.511 84.74 34.273 82.824 34.273 C 81.18 34.273 79.513 33.734 78.011 32.766 C 75.989 31.82 73.67 31.005 71.001 30.243 C 68.277 29.545 65.575 29.169 62.727 29.169 C 59.25 29.169 56.589 29.726 54.589 30.851 C 52.611 31.964 51.663 33.346 51.753 35.166 Z M 12.452 72.49 L 7.986 72.49 C 6.2 72.49 4.796 71.086 4.796 69.3 C 4.796 67.513 6.2 66.11 7.986 66.11 L 12.452 66.11 C 14.239 66.11 15.642 67.513 15.642 69.3 C 15.642 71.086 14.175 72.49 12.452 72.49 Z M 29.87 21.449 C 29.04 21.449 28.211 21.13 27.637 20.492 C 27.509 20.365 27.381 20.173 27.254 19.982 C 27.126 19.791 27.062 19.599 26.935 19.408 C 26.871 19.216 26.807 19.025 26.743 18.834 C 26.68 18.642 26.68 18.451 26.68 18.196 C 26.68 18.004 26.68 17.813 26.743 17.558 C 26.807 17.366 26.871 17.175 26.935 16.983 C 26.999 16.792 27.126 16.601 27.254 16.409 C 27.381 16.218 27.509 16.09 27.637 15.899 C 28.402 15.133 29.487 14.814 30.508 15.006 C 30.699 15.069 30.89 15.133 31.082 15.197 C 31.273 15.261 31.465 15.388 31.656 15.516 C 31.847 15.644 31.975 15.771 32.166 15.899 C 32.294 16.026 32.422 16.218 32.549 16.409 C 32.677 16.601 32.741 16.792 32.868 16.983 C 32.932 17.175 32.996 17.366 33.06 17.558 C 33.123 17.749 33.123 17.94 33.123 18.196 C 33.123 18.387 33.123 18.642 33.06 18.834 C 32.996 19.025 32.932 19.216 32.868 19.408 C 32.804 19.599 32.677 19.791 32.549 19.982 C 32.422 20.173 32.294 20.301 32.166 20.492 C 32.039 20.62 31.847 20.748 31.656 20.875 C 31.465 21.003 31.273 21.067 31.082 21.194 C 30.89 21.258 30.699 21.322 30.508 21.386 C 30.252 21.449 30.061 21.449 29.87 21.449 Z M 7.986 46.969 C 7.157 46.969 6.327 46.65 5.753 46.012 C 5.626 45.885 5.498 45.693 5.37 45.502 C 5.243 45.311 5.179 45.119 5.051 44.928 C 4.988 44.736 4.924 44.545 4.86 44.354 C 4.796 44.162 4.796 43.971 4.796 43.716 C 4.796 43.524 4.796 43.333 4.86 43.078 C 4.924 42.886 4.988 42.695 5.051 42.503 C 5.115 42.312 5.243 42.121 5.37 41.929 C 5.498 41.738 5.626 41.61 5.753 41.419 C 5.881 41.291 6.072 41.164 6.264 41.036 C 6.455 40.908 6.646 40.845 6.838 40.717 C 7.029 40.653 7.221 40.589 7.412 40.526 C 7.795 40.462 8.241 40.462 8.624 40.526 C 8.816 40.589 9.007 40.653 9.198 40.717 C 9.39 40.781 9.581 40.908 9.773 41.036 C 9.964 41.164 10.092 41.291 10.283 41.419 C 10.411 41.546 10.538 41.738 10.666 41.929 C 10.793 42.121 10.857 42.312 10.985 42.503 C 11.049 42.695 11.112 42.886 11.176 43.078 C 11.24 43.269 11.24 43.46 11.24 43.716 C 11.24 43.907 11.24 44.162 11.176 44.354 C 11.112 44.545 11.049 44.736 10.985 44.928 C 10.921 45.119 10.793 45.311 10.666 45.502 C 10.538 45.693 10.411 45.821 10.283 46.012 C 9.645 46.65 8.816 46.969 7.986 46.969 Z"
            />
          </svg>
        </div>
      </a>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import QRCode from 'qrcode-svg'
import { decodelnurl, type LNURLWithdrawParams } from 'js-lnurl'

import { LNURL_ORIGIN } from '@/modules/constants'
import ButtonDefault from '../components/ButtonDefault.vue'
import LinkDefault from '../components/typography/LinkDefault.vue'

const route = useRoute()
const router = useRouter()

const cards = ref<Record<string, string>[]>([])
const withdrawId = ref<string | undefined>(undefined)
const userErrorMessage = ref<string | undefined>(undefined)
const userWarnings = ref<string[]>([])
const lnurlDescriptionMessage = ref<string | undefined>(undefined)
const inputWithdrawId = ref<string>('')

const load = async () => {
  userErrorMessage.value = undefined

  withdrawId.value = route.params.withdrawId == null || route.params.withdrawId === '' ? undefined : String(route.params.withdrawId)
  if (withdrawId.value == null) {
    return
  }

  let lnurls: string[]
  try {
    const response = await axios.get(
      `${LNURL_ORIGIN}/withdraw/csv/${withdrawId.value}`,
      {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      },
    )
    lnurls = response.data.toLowerCase().match(/,*?((lnurl)([0-9]{1,}[a-z0-9]+){1})/g)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      userErrorMessage.value = (error.response?.data as { detail: string }).detail
    }
    console.error(error)
    return
  }

  let lnurlContent: LNURLWithdrawParams
  try {
    const response = await axios.get(
      new URL(decodelnurl(lnurls[0])).href,
      {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      },
    )
    lnurlContent = response.data
  } catch (error) {
    if (
      axios.isAxiosError(error)
      && error.response?.status === 404
      && ['Withdraw is spent.', 'LNURL-withdraw not found.']
        .includes((error.response?.data as { detail: string }).detail)
    ) {
      userErrorMessage.value = `All LNURLs from withdraw "${withdrawId.value}" have been used.`
      return
    }
    userErrorMessage.value = 'Server cannot find LNURL.'
    console.error(error)
    return
  }

  if (lnurlContent.tag !== 'withdrawRequest') {
    userErrorMessage.value = 'Sorry, this website does not support the provided type of LNURL.'
    return
  }
  if (lnurlContent.minWithdrawable != lnurlContent.maxWithdrawable) {
    userWarnings.value = [...userWarnings.value, 'Warning: Minimum withdrawable amount differs from maximum withdrawable amount. Are you sure this is correct?']
  }
  if ((lnurlContent.minWithdrawable / 1000) < 1000) {
    userWarnings.value = [...userWarnings.value, 'Warning: Amount per LNURL is smaller than 1000 sats. Some wallet apps (like BlueWallet, Phoenix or Breez) might have problems with that. Please test your Tip cards before handing them out. :)']
  }
  lnurlDescriptionMessage.value = lnurlContent.defaultDescription

  cards.value = lnurls.map(lnurl => {
    const routeHref = router.resolve({ name: 'landing', query: { lightning: lnurl.toUpperCase() } }).href
    const url = `${location.protocol}//${location.host}${routeHref}`
    return {
      url,
      qrCodeSvg: new QRCode({
          content: url,
          padding: 0,
          join: true,
          width: 160,
          height: 160,
        }).svg(),
    }
  })

  if (cards.value.length % 2 !== 0) {
    cards.value = [...cards.value, { url: '' }]
  }
}

onMounted(load)
  
watch(() => route.params, load)
  


</script>
