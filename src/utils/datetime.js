export default function compareTime(time1, time2) {
  let dateTime1 = new Date(time1);
  let dateTime2 = new Date(time2);

  return dateTime1.getTime() > dateTime2.getTime();
}
