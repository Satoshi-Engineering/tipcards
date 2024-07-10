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
  // enrich the error with the response data message, as vitest only shows the error message and not the response data
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
