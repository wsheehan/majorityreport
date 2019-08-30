import axios from 'axios'

const url = "https://api.thegraph.com/subgraphs/name/wsheehan/majority-report"

async function graphql (query) {
  const postData = JSON.stringify({ query })
  try {
    const res = await axios.post(url, postData)
    return res.data.data    
  } catch (err) {
    console.error(err)
  }
}

export default graphql