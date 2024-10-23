<template>
  <form data-test="profile-form" @submit.prevent="update(profileInternal)">
    <FormContainer
      class="mb-6"
      :headline="$t('userAccount.profileFormHeadline')"
    >
      <TextField
        v-model="profileInternal.accountName"
        data-test="profile-form-account-name"
        :label="$t('userAccount.form.accountName')"
        :description="`(${$t('userAccount.form.accountNameHint')})`"
        :disabled="fetching"
      />
      <TextField
        v-model="profileInternal.displayName"
        data-test="profile-form-display-name"
        :label="$t('userAccount.form.displayName')"
        :description="`(${$t('userAccount.form.displayNameHint')})`"
        :disabled="fetching"
      />
      <TextField
        v-model="profileInternal.email"
        data-test="profile-form-email"
        :label="$t('userAccount.form.emailAddress')"
        :description="`(${$t('userAccount.form.emailAddressHint')})`"
        :disabled="fetching"
      />
    </FormContainer>
    <ButtonContainer>
      <ButtonDefault
        type="submit"
        :loading="fetching"
      >
        <span>
          {{ $t('userAccount.form.save') }}
        </span>
        <IconCheckSquareFill v-if="isSaved && !fetching" class="inline-block ms-2 h-[1em] w-[1em]" />
        <IconExclamationSquare v-else-if="!fetching" class="inline-block ms-2 h-[1em] w-[1em]" />
        <span v-else-if="fetching" class="inline-block ms-2 h-[1em] w-[1em]" />
      </ButtonDefault>
      <UserErrorMessages :user-error-messages="fetchingUserErrorMessages" />
    </ButtonContainer>
  </form>
</template>

<script setup lang="ts">
import isEqual from 'lodash.isequal'
import { storeToRefs } from 'pinia'
import { reactive, computed, watchEffect, onBeforeMount, onBeforeUnmount } from 'vue'

import { ProfileDto } from '@shared/data/trpc/ProfileDto'

import ButtonContainer from '@/components/buttons/ButtonContainer.vue'
import ButtonDefault from '@/components/buttons/ButtonDefault.vue'
import FormContainer from '@/components/forms/FormContainer.vue'
import TextField from '@/components/forms/TextField.vue'
import IconCheckSquareFill from '@/components/icons/IconCheckSquareFill.vue'
import IconExclamationSquare from '@/components/icons/IconExclamationSquare.vue'
import UserErrorMessages from '@/components/UserErrorMessages.vue'
import { useProfileStore } from '@/stores/profile'

const profileStore = useProfileStore()
const {
  userAccountName,
  userDisplayName,
  userEmail,
  fetching,
  fetchingUserErrorMessages,
} = storeToRefs(profileStore)
const {
  subscribe,
  unsubscribe,
  update,
} = profileStore

const profileInternal = reactive(ProfileDto.partial().parse({}))

const isSaved = computed(() => isEqual({
  accountName: userAccountName.value,
  displayName: userDisplayName.value,
  email: userEmail.value,
}, profileInternal))

onBeforeMount(async () => {
  try {
    await subscribe()
    profileInternal.accountName = userAccountName.value
    profileInternal.displayName = userDisplayName.value
    profileInternal.email = userEmail.value
  } catch {
    // do nothing
  }
})
onBeforeUnmount(unsubscribe)
watchEffect(() => {
  if (userAccountName.value != null && profileInternal.accountName == null) {
    profileInternal.accountName = userAccountName.value
  }
})
watchEffect(() => {
  if (userDisplayName.value != null && profileInternal.displayName == null) {
    profileInternal.displayName = userDisplayName.value
  }
})
watchEffect(() => {
  if (userEmail.value != null && profileInternal.email == null) {
    profileInternal.email = userEmail.value
  }
})
</script>
