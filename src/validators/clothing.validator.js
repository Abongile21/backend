const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export function validateClothingRequest(body) {
  const issues = [];
  const latitude = Number(body?.latitude);
  const longitude = Number(body?.longitude);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    issues.push('latitude must be a number between -90 and 90.');
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    issues.push('longitude must be a number between -180 and 180.');
  }
  if (typeof body?.location !== 'string' || !body.location.trim()) {
    issues.push('location is required.');
  }
  if (typeof body?.temperatureCelsius !== 'number' || !Number.isFinite(body.temperatureCelsius)) {
    issues.push('temperatureCelsius must be supplied by a verified FortyGuard temperature result.');
  }
  if (typeof body?.startDate !== 'string' || !ISO_DATE.test(body.startDate)) {
    issues.push('startDate must use YYYY-MM-DD format.');
  }
  if (typeof body?.startTime !== 'string' || !TIME.test(body.startTime)) {
    issues.push('startTime must use HH:MM 24-hour format.');
  }
  if (body?.endTime !== undefined && (typeof body.endTime !== 'string' || !TIME.test(body.endTime))) {
    issues.push('endTime must use HH:MM 24-hour format.');
  }
  if (body?.endTime && body.endTime <= body.startTime) {
    issues.push('endTime must be later than startTime.');
  }
  return issues;
}
