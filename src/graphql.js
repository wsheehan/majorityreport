import axios from 'axios'

const url = "http://127.0.0.1:8000/subgraphs/name/wsheehan/augur-reporting-subgraph"

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