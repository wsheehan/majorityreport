import axios from 'axios'

// connection to backend API
const { REACT_APP_ENV } = process.env
const BASE_URL = REACT_APP_ENV === "prod" 
  ? "https://majority-report-api.herokuapp.com" 
  : "http://localhost:4000"

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

export async function precedent (id) {
  try {
    const { data } = await axios.get(
      `${BASE_URL}/precedent/${id}`
    )
    return data
  } catch (e) {
    return { err: e }
  }
}

export async function market (id) {
  try {
    const { data } = await axios.get(
      `${BASE_URL}/market/${id}`
    )
    return data
  } catch (e) {
    return { err: e }
  }
}