export function createRandomOrderID() {
  return Math.floor(
    100000 + Math.random() * Math.floor(100000 + Math.random() * 900000),
  );
}
