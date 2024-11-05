import { dateWithTimeFormat } from '@/utils/dateFormats'
import { SetDto } from '@shared/data/trpc/SetDto'
import { useI18n } from 'vue-i18n'

export default () => {
  const { d, t } = useI18n()

  class SetDisplayInfo {
    static create(set: SetDto) {
      return new SetDisplayInfo(set)
    }

    get displayName() {
      return this.set?.settings.name || t('sets.unnamedSetNameFallback')
    }
    get displayDate() {
      return d(this.set?.created, dateWithTimeFormat)
    }
    get displayNumberOfCards() {
      return t('general.cards', { count: this.set?.settings?.numberOfCards })
    }
    get combinedSearchableString() {
      return `${this.displayName} ${this.displayDate} ${this.displayNumberOfCards}`
    }

    constructor(set: SetDto) {
      this.set = set
    }
    set: SetDto
  }

  return SetDisplayInfo
}
