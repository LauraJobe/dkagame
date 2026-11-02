// Development stand-in for firebase/auth (one anonymous uid per tab).
const uid = (() => {
  let id = sessionStorage.getItem('fakeUid');
  if (!id) {
    id = 'u' + Math.random().toString(36).slice(2, 10);
    sessionStorage.setItem('fakeUid', id);
  }
  return id;
})();
export const getAuth = () => ({});
export const signInAnonymously = async () => ({ user: { uid } });
export const onAuthStateChanged = (_a, cb) => {
  setTimeout(() => cb({ uid }), 0);
  return () => {};
};
export const initializeApp = () => ({});
