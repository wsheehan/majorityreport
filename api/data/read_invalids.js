const fs = require('fs')
const axios = require('axios')

const url = "https://api.thegraph.com/subgraphs/name/wsheehan/majority-report"

const query = `{
  markets(where: { invalid: true, finalized: true }, first: 500) {
    id
  }
}`

async function fetchInvalids () {
  const postData = JSON.stringify({ query })
  try {
    const res = await axios.post(url, postData)
    return res.data.data.markets    
  } catch (err) {
    console.error(err)
  }
}

async function run() {
  const invalids = await fetchInvalids()
  const fileInvalids = JSON.parse(fs.readFileSync('./v1-invalid.json'))

  const missing = invalids.reduce((acc, m) => {
    const match = fileInvalids.find(({id}) => m.id === id)
    if (!match || match.precedents.length === 0) {
      acc.push(m.id)
    } 
    return acc
  }, [])
  console.log(missing)
}

run()
  .then()