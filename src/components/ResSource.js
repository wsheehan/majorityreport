import React from 'react'
import PatternExtractor from 'pattern-extractor'

export default function ResolutionSource ({ text }) {
  const res = PatternExtractor.TextArea.extractAllUrls(text)
  
  if (res.length > 0) {
    const {start, end} = res[0].index
    const url = text.slice(start, end)
    return (
      <span>
        {text.slice(0, start)}<a href={url}>{url}</a>{text.slice(end)}
      </span>
    )
  }

  return text
}