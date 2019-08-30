import BN from 'bignumber.js'
import { DateTime } from 'luxon'
import { hexToAscii } from 'web3-utils'

const parsers = {
  ms: 'fromMillis',
  s: 'fromSeconds'
}

export function formatTs(ts, format = 's', formatter = 'fff') {
  const parser = parsers[format]
  return DateTime[parser](Number(ts), { zone: 'utc'}).toFormat(formatter)
}

export function weiToDec (wei) {
  return wei.dividedBy(new BN(10).pow(18))
}

export function parseMarket (market, feeWindows) {
  let extra
  try {
    extra = JSON.parse(market.extraInfo)
  } catch {
    extra = JSON.parse(market.extraInfo + '"}')
  }
  market.outcomes = getOutcomes(market)

  const parsedMarket = {
    ...market,
    ...extra,
    ...fillRounds(market)
  }

  parsedMarket.status = getStatus(parsedMarket, feeWindows)
  parsedMarket.tentativeOutcome = parsedMarket.rounds.length !== 0 ? parsedMarket.rounds[0].outcome : "N/A"
  return parsedMarket
}

function getStatus(market, feeWindows) {
  if (market.status === "finalized") return "Finalized"

  if (!market.rounds || market.rounds.length === 0) return "Open"
  const currentFeeWindow = feeWindows[1]
  const mostRecentRound = market.rounds[0]

  const compTs = mostRecentRound.completedTimestamp
  if (market.rounds.length === 1) {
    if (compTs >= Number(currentFeeWindow.startTime)) {
      return "Initial Report Submitted"
    } else {
      if (compTs <= Number(feeWindows[2].startTime)) {
        return "Awaiting Finalization"
      }
      return "Initial Report Pending"
    }
  }

  if (compTs >= Number(currentFeeWindow.startTime)) {
    return "Awaiting Next Window"
  } 

  if (compTs <= Number(feeWindows[2].startTime)) {
    return "Awaiting Finalization"
  }

  return "Crowdsourcing"
}

export function fillRounds (market) {
  const { outcomes, disputes, initialReport } = market
  if (!initialReport || market.marketType === "Scalar") {
    return { rounds: [], unfilledRounds: [] }
  }
  const initialReportOutcome = getDisputeOutcome(market, initialReport)
  const rounds = [
    { 
      outcome: initialReportOutcome, 
      size: new BN(initialReport.amountStaked),
      sizeFilled: new BN(initialReport.amountStaked),
      completedTimestamp: initialReport.timestamp,
      round: 0
    }
  ]

  const unfilledRounds = []
  outcomes.forEach(o => {
    if (o.description === initialReportOutcome) {
      o.staked = new BN(initialReport.amountStaked)
      o.stakedOnOthers = new BN(0)
    } else {
      o.staked = new BN(0)
      o.stakedOnOthers = new BN(initialReport.amountStaked)
    }
  })

  // map outcomes to disputes
  disputes.forEach(d => {
    d.outcome = getDisputeOutcome(market, d)
    d.size = new BN(d.size)
    d.sizeFilled = new BN(d.sizeFilled)
  })

  const _disputes = [...disputes]

  // let k = _disputes.length
  while (_disputes.length > 0) {
    for (let i = 0; i < _disputes.length; i++) {
      const dispute = _disputes[i]
      const outcome = outcomes.find(o => o.description === dispute.outcome)
      const previousOutcome = rounds[0].outcome
      if (outcome.description != previousOutcome && outcome.stakedOnOthers.times(2).eq(dispute.sizeFilled.plus(outcome.staked))) {
        outcomes.forEach(o => {
          if (o.description === outcome.description) {
            o.staked = o.staked.plus(dispute.size)
          } else {
            o.stakedOnOthers = o.stakedOnOthers.plus(dispute.size)
          }
        })

        // remove el
        _disputes.splice(i, 1)

        // add round
        rounds.unshift({
          outcome: outcome.description, 
          size: dispute.size,
          sizeFilled: dispute.sizeFilled,
          round: disputes.length - _disputes.length,
          completedTimestamp: dispute.completedTimestamp
        })
        break
      }

      if (i == _disputes.length - 1) {
        // only unfilled rounds left
        _disputes.forEach(d => {
          unfilledRounds.push({
            outcome: d.outcome, 
            size: d.size,
            sizeFilled: d.sizeFilled,
            round: 0
          })
        })
        return { rounds, unfilledRounds }
      }
    }
  }
  return { rounds, unfilledRounds }
}

export function getDisputeOutcome({ outcomes, marketType }, dispute) {
  if (dispute.invalid) return "INVALID"

  if (["Categorical", "Binary"].includes(marketType)) {
    const i = dispute.payoutNumerators.findIndex(n => Number(n) > 0)
    return outcomes.find(o => o.id === i).description
  } else {
    return "empty"
  }
}

function getOutcomes(market) {
  if (market.marketType === 'Binary') {
    return [{description: 'NO', id: 0}, {description: 'YES', id: 1}, {description: 'INVALID', id: 2}]
  } else {
    const formattedOutcomes = market.outcomes.map((o, id) => {
      return { description: hexToAscii(o), id }
    })
    return [...formattedOutcomes, {description: 'INVALID', id: market.outcomes.length}]
  }
}

export function getReliability (validDecimal) {
  if (validDecimal === 1) {
    return { label: "Pristine", color: "green" }
  } else if (validDecimal >= 0.95) {
    return { label: "Very Good", color: "green" }
  } else if (validDecimal >= 0.9) {
    return { label: "Good", color: "green" }
  } else if (validDecimal >= 0.5) {
    return { label: "Bad", color: "orange" }
  } else if (validDecimal === NaN) {
    return { label: "Unknown", color: "gray" }
  } else {
    return { label: "Abysmal", color: "red" }
  }
}