import BN from 'bignumber.js'
import { hexToAscii } from 'web3-utils'

export function weiToDec (wei) {
  return wei.dividedBy(new BN(10).pow(18))
}

export function parseMarket (market) {
  const extra = JSON.parse(market.extraInfo)
  market.outcomes = getOutcomes(market)

  const parsedMarket = {
    ...market,
    ...extra,
    ...fillRounds(market)
  }

  parsedMarket.tentativeOutcome = parsedMarket.rounds[0].outcome
  return parsedMarket
}

export function fillRounds (market) {
  const { outcomes, disputes, initialReport } = market
  const initialReportOutcome = getDisputeOutcome(market, initialReport)
  const rounds = [
    { 
      outcome: initialReportOutcome, 
      size: new BN(initialReport.amountStaked),
      sizeFilled: new BN(initialReport.amountStaked),
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
          round: disputes.length - _disputes.length
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

export function getMarketOutcome (market) {
  const outcomes = getOutcomes(market)
  return getDisputeOutcome({ outcomes, marketType: market.marketType }, market)
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