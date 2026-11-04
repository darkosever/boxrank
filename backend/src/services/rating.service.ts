const K = 32;

function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

export function calculateElo(
  ratingA: number,
  ratingB: number,
  result: 'win' | 'loss' | 'draw',
): { ratingBefore: number; newRating: number } {
  const expected = expectedScore(ratingA, ratingB);
  const score = result === 'win' ? 1 : result === 'draw' ? 0.5 : 0;
  const newRating = Math.round(ratingA + K * (score - expected));
  return { ratingBefore: ratingA, newRating };
}
