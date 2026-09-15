import { request } from './api';

// httpbin's /delay/N holds the response server-side for N seconds — a real,
// externally-caused slow request, not a setTimeout pretending to be one. Good
// enough to make the Network panel's Initiator tab worth reading, not app data.
const delayUrl = (seconds: number) => `https://httpbin.org/delay/${seconds}`;

export function fetchQuickWidget() {
  return request(delayUrl(0));
}

export function fetchMediumReport() {
  return loadReportFromCache();
}

function loadReportFromCache() {
  return request(delayUrl(1));
}

export function fetchSlowArchive() {
  return retrieveArchive();
}

function retrieveArchive() {
  return request(delayUrl(3));
}
