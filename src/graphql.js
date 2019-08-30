import axios from 'axios'

const url = "https://api.thegraph.com/subgraphs/name/wsheehan/majority-report"

async function graphql (query) {
  const postData = JSON.stringify({ query })
  const res = await axios.post(url, postData)

  if (res.status !== 200 || res.data.errors) {
    res.data.errors.map(console.error)
  } else {
    return res.data.data
  }
}

export default graphql