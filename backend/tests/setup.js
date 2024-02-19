// workaround as jest does not pass command line arguments to the executed tests
module.exports = (_, projectConfig) => {
  const argument = process.argv.slice(2).find((value) => value.indexOf('--envFilePostfix') === 0)
  let envFilePostFix = ''
  if (argument) {
    envFilePostFix = argument.split('=')[1]
  }
  projectConfig.globals.__ENV_FILE_POSTFIX__ = envFilePostFix
}
