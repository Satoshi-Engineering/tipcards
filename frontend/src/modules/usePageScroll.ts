export const usePageScroll = () => ({
  enablePageScroll: () => {
    document.documentElement.style.overflow = ''
    document.documentElement.style.paddingInlineEnd = ''
  },
  disablePageScroll: () => {
    const originalWidth = document.documentElement.scrollWidth
    document.documentElement.style.overflow = 'hidden'
    document.documentElement.style.paddingInlineEnd = `${document.documentElement.scrollWidth - originalWidth}px`
  },
})
