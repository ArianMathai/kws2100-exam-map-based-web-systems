export function getMinutes(seconds: number) {
  let minutes: string | number = Math.floor(seconds / 60);
  let extraSeconds: string | number = seconds % 60;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  extraSeconds = extraSeconds < 10 ? "0" + extraSeconds : extraSeconds;
  return `${minutes}:${extraSeconds}`;
}
