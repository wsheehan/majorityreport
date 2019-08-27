import axios from 'axios'

// connection to backend API
const BASE_URL = "http://localhost:4000"

export async function precedents () {
  try {
    const { data } = await axios.get(
      `${BASE_URL}/precedents`
    )
    return data
  } catch (e) {
    return { err: e }
  }
}