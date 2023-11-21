import Database from './Database'

export const getClient = async () => {
  return await Database.getDatabase()
}
