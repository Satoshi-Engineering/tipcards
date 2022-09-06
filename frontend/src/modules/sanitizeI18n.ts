import sanitizeHtml from 'sanitize-html'

export default (htmlString: string) => sanitizeHtml(htmlString, {
  allowedTags: ['strong', 'em', 'b', 'i', 'br'],
})
