import type { DateTimeOptions } from 'vue-i18n'

export const dateWithTimeFormat: DateTimeOptions = {
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: 'numeric', minute: 'numeric',
}

export const dateFormat: DateTimeOptions = {
  year: 'numeric', month: '2-digit', day: '2-digit',
}
