export default () => {
  // trpc subscriptions are currently making problems with safari on ios
  // maybe we will add a browser detection here in the future
  // https://gitlab.satoshiengineering.com/satoshiengineering/projects/-/issues/1521#note_22890

  // 2025-02-28 ios safari polling is not working currently, so we use subscriptions again
  return true
}
