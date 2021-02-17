import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_CLIENT_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_CLIENT_DATABASE_URL,
    projectId: process.env.FIREBASE_CLIENT_PROJECT_ID,
    storageBucket: process.env.FIREBASE_CLIENT_STORAGE_BUCKET,
    appId: process.env.FIREBASE_CLIENT_APP_ID,
    messagingSenderId: process.env.FIREBASE_CLIENT_MESSAGING_SENDER_ID,
  })
}

const provider = new firebase.auth.GithubAuthProvider()

// firebaseuiで使用
const authProviders = {
  Email: firebase.auth.EmailAuthProvider.PROVIDER_ID,
  Google: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
  Facebook: firebase.auth.FacebookAuthProvider.PROVIDER_ID,
  Twitter: firebase.auth.TwitterAuthProvider.PROVIDER_ID,
  Github: firebase.auth.GithubAuthProvider.PROVIDER_ID,
}

const authActions = {
  login() {
    return new Promise((resolve, reject) => {
      firebase
        .auth()
        .signInWithRedirect(provider) // ログインページにリダイレクトしてログイン
        .then(() => resolve())
        .catch((err) => reject(err))
    })
  },
  logout() {
    return new Promise((resolve, reject) => {
      firebase
        .auth()
        .signOut()
        .then(() => resolve())
        .catch((err) => reject(err))
    })
  },
  authCheck() {
    return new Promise((resolve, reject) => {
      // 現在ログインしているユーザを取得
      try {
        firebase.auth().onAuthStateChanged((user) => resolve(user))
      } catch (err) {
        reject(err)
      }
    })
  },
}

const firebaseAuth = firebase.auth()

const db = firebase.firestore()

const { Timestamp, GeoPoint } = firebase.firestore

export {
  firebase,
  authActions,
  authProviders,
  firebaseAuth,
  db,
  Timestamp,
  GeoPoint,
}

// ===================================
// Cloud FireStore
// ===================================

export const UserRoot = db
  .collection('version')
  .doc(process.env.VERSION)
  .collection('user')

export const EventRoot = db
  .collection('version')
  .doc(process.env.VERSION)
  .collection('event')

// =======================================
// Cloud Storate
// =======================================
