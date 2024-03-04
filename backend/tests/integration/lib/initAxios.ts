import axios, { AxiosError } from 'axios'

const handleAxiosError = (error: unknown) => {
  if (
    !axios.isAxiosError(error)
    || !error.response
  ) {
    return error
  }
  let message = error.message
  if (typeof error.response.data.message === 'string') {
    message += `\nBackend message: ${error.response.data.message}`
  } else if (typeof error.response.statusText === 'string') {
    message += `\nBackend message: ${error.response.statusText}`
  }
  // jest is trying to stringify the error object, so we need to remove the circular reference
  // https://gitlab.satoshiengineering.com/satoshiengineering/projects/-/issues/957
  const customError = new AxiosError(message)
  customError.response = {
    data: error.response.data,
    status: error.response.status,
    statusText: String(error.response.status),
    headers: error.response.headers,
    config: error.response.config,
  }
  throw customError
}
axios.interceptors.response.use((response) => response, handleAxiosError)
