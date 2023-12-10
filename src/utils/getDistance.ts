interface Cordinate {
  longitude: number;
  latitude: number;
}
const toRadians = (degrees: number) => {
  return (degrees * Math.PI) / 180;
};
export const getDistance = (
  user1: Cordinate,
  user2: Cordinate,
  expectedDistance: number,
) => {
  const EarthRadius = 6371;

  const lat1Rad = toRadians(user1.latitude);
  const lon1Rad = toRadians(user1.longitude);
  const lat2Rad = toRadians(user2.latitude);
  const lon2Rad = toRadians(user2.longitude);
  const dlat = lat2Rad - lat1Rad;
  const dlon = lon2Rad - lon1Rad;

  const a =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dlon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = EarthRadius * c;

  return distance <= expectedDistance;
};
