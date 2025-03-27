import DOMPurify from 'dompurify'

const purify = DOMPurify(window)

export default (htmlString: string, additionalAllowedTags: string[] = []) => purify.sanitize(htmlString, {
  ALLOWED_TAGS: ['strong', 'em', 'b', 'i', 'br', ...additionalAllowedTags],
})
