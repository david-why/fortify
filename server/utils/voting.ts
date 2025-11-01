import type { H3Event } from 'h3'

// voting states:
// - voting
// - already_voted, closed, thanks
// - trick_or_treating (for halloween)

export async function getCurrentBallotData(
  event: H3Event,
  { createNew = false }: { createNew?: boolean } = {}
): Promise<Ballot> {
  const res = await fetch(
    `https://siege.hackclub.com/great-hall${
      createNew ? '?create_new=true' : ''
    }`,
    {
      headers: {
        Cookie: `_siege_session=${getSessionCookie(event)}`,
      },
      redirect: 'manual',
    }
  )
  if (!res.ok) {
    throw new Error('Failed to get current ballot ID')
  }
  const htmlText = await res.text()

  const currentBallotIdMatch = htmlText.match(
    /const currentBallotId = ([0-9]+);/
  )
  const votingStateMatch = htmlText.match(
    /const serverVotingState = ['"](.*?)['"]/
  )
  const meepleMessageMatch = htmlText.match(
    /const meepleMessage = ['"](.*)['"];/
  )
  const allowRevoteMatch = htmlText.match(/const allowRevote = (.*);/)
  if (
    !currentBallotIdMatch ||
    !votingStateMatch ||
    !meepleMessageMatch ||
    !allowRevoteMatch
  ) {
    throw new Error('Data missing on great hall page')
  }

  const currentBallotId = parseInt(currentBallotIdMatch[1]!)
  const votingState = votingStateMatch[1]!
  const meepleMessage = meepleMessageMatch[1]!
  const allowRevote = allowRevoteMatch[1]! === 'true'

  return { id: currentBallotId, votingState, meepleMessage, allowRevote }
}
