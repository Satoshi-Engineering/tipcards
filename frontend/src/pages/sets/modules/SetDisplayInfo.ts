import { dateWithTimeFormat } from '@/utils/dateFormats'
import { SetDto } from '@shared/data/trpc/SetDto'
import type { Composer, I18nOptions } from 'vue-i18n'

type I18n = Composer<NonNullable<I18nOptions['messages']>, NonNullable<I18nOptions['datetimeFormats']>, NonNullable<I18nOptions['numberFormats']>, NonNullable<I18nOptions['locale']>>

export default class SetDisplayInfo {
  static create(set: SetDto, i18n: I18n) {
    return new SetDisplayInfo(set, i18n)
  }

  get displayName() {
    return this.set?.settings.name || this.i18n.t('sets.unnamedSetNameFallback')
  }
  get displayDate() {
    return this.i18n.d(this.set?.changed, dateWithTimeFormat)
  }
  get displayNumberOfCards() {
    return this.i18n.t('general.cards', { count: this.set?.settings?.numberOfCards })
  }
  get combinedSearchableString() {
    return `${this.displayName} ${this.displayDate} ${this.displayNumberOfCards}`.toLowerCase()
  }

  private constructor(set: SetDto, i18n: I18n) {
    this.i18n = i18n
    this.set = set
  }

  private readonly set: SetDto
  private readonly i18n: I18n
}
