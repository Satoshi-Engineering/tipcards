import { config } from '@vue/test-utils'

config.global.provide = {
  linkPrivacyPolicy: 'https://satoshiengineering.com/privacy-policy',
  linkLegalNotice: 'https://satoshiengineering.com/legal-notice',
  supportEmail: 'support@sate.tools',
  linkLinkedIn: 'https://www.linkedin.com/company/satoshi-engineering/',
  linkX: 'https://x.com/SatoshiEngTech',
  linkInstagram: 'https://www.instagram.com/satoshiengineering/',
}
