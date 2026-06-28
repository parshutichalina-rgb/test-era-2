export function formatEta(seconds: number): string {
  if (seconds <= 0) return "готово";
  if (seconds < 60) return `${seconds} сек`;

  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;
  if (restSeconds === 0) return `${minutes} мин`;
  return `${minutes} мин ${restSeconds} сек`;
}

export function formatCredits(credits: number): string {
  return `${credits} cr`;
}
