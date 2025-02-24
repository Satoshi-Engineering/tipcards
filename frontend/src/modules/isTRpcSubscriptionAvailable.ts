export default () => {
  // trpc subscriptions are currently making problems with safari on ios
  // maybe we will add a browser detection here in the future
  // https://gitlab.satoshiengineering.com/satoshiengineering/projects/-/issues/1521#note_22890
  return false
}
