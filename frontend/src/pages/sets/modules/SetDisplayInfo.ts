import { dateWithTimeFormat } from '@/utils/dateFormats'
import { SetDto } from '@shared/data/trpc/SetDto'
import { useI18n } from 'vue-i18n'

export default class SetDisplayInfo {
  static create(set: SetDto) {
    return new SetDisplayInfo(set)
  }
  get displayName() {
    return this.set?.settings.name || this.t('sets.unnamedSetNameFallback')
  }
  get displayDate() {
    return this.d(this.set?.created, dateWithTimeFormat)
  }
  get displayNumberOfCards() {
    return this.t('general.cards', { count: this.set?.settings?.numberOfCards })
  }
  get combinedSearchableString() {
    return `${this.displayName} ${this.displayDate} ${this.displayNumberOfCards}`
  }

  private constructor(set: SetDto, i18n = useI18n()) {
    this.t = i18n.t
    this.d = i18n.d
    this.set = set
  }
  private t
  private d
  private set: SetDto
}
