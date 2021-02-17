<template>
  <v-app>
    <v-app-bar color="primary" dense title absolute app>
      <!--
      <img src="/icon.png" style="max-height: 100%;" />
      -->
      <router-link tag="div" to="/">
        <v-toolbar-title class="toolbar-title">
          <span class="title-font">ツイ募</span>
        </v-toolbar-title>
      </router-link>
      <v-spacer />

      <template v-if="user.id === ''">
        <v-btn color="primary" depressed @click="login()">
          <v-icon size="25" left>mdi-twitter</v-icon>
          ログイン
        </v-btn>
      </template>

      <template v-else>
        <v-menu left bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-avatar size="40" v-bind="attrs" v-on="on" @click="() => {}">
              <img :src="user.photoURL" />
            </v-avatar>
          </template>
          <v-list>
            <v-list-item :to="'/user/' + user.id">
              <v-list-item-title>作成・参加したイベント</v-list-item-title>
            </v-list-item>
            <v-list-item @click="logout">
              <v-list-item-title>ログアウト</v-list-item-title>
            </v-list-item>
            <v-list-item @click="handleDeleteAccount">
              <v-list-item-title>退会する</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>

      <!--
      <v-btn text rounded>カテゴリ</v-btn>
      <v-text-field dense single-line outlined label="キーワードを入力" prepend-inner-icon="mdi-magnify"></v-text-field>
      <v-spacer></v-spacer>
      -->
    </v-app-bar>

    <v-main class="content" style="margin-bottom: 100px">
      <v-container style="padding-left: 0; padding-right: 0; width: 100%" fluid>
        <v-row
          style="margin: 0; padding: 0; width: 100%"
          align="center"
          justify="center"
        >
          <v-col style="padding: 0" cols="11" sm="6" md="4">
            <nuxt />
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <v-footer absolute app>
      <div>
        <nuxt-link to="/contact">お問い合わせ</nuxt-link>
        <br />
        <nuxt-link to="/privacy_policy">プライバシーポリシー</nuxt-link>
        <br />
        <nuxt-link to="/terms">利用規約</nuxt-link>
        <br />
        <span>&copy;Copyright 2020 Twibo .</span>
      </div>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'nuxt-property-decorator'
import firebase from 'firebase/app'
import { userStore } from '~/store'
import { UserRoot, db, EventRoot } from '~/plugins/firebase'

@Component
export default class Default extends Vue {
  user = {
    id: userStore.id,
    displayName: userStore.displayName,
    photoURL: userStore.photoURL,
  }

  get LoginedUser() {
    return userStore.id
  }

  @Watch('LoginedUser')
  onChangeUser() {
    this.user = userStore
  }

  mounted() {
    setTimeout(() => {
      this.user = {
        id: userStore.id,
        displayName: userStore.displayName,
        photoURL: userStore.photoURL,
      }
    }, 0)
  }

  async handleDeleteAccount() {
    const userDocRef = UserRoot.doc(this.user.id)
    const userDoc = await userDocRef.get()
    const userData = userDoc.data()

    if (userData === undefined) return

    const userOwnerEvent = userData.ownerEvent
    const userParticipantEvent = userData.participantEvent

    const batch = db.batch()

    userOwnerEvent.forEach((eventId: string) => {
      batch.delete(EventRoot.doc(eventId))
      batch.delete(EventRoot.doc(eventId).collection('secure').doc(eventId))
    })

    userParticipantEvent.forEach((eventId: string) => {
      batch.update(EventRoot.doc(eventId), {
        participant: firebase.firestore.FieldValue.arrayRemove(this.user.id),
      })
      batch.update(EventRoot.doc(eventId).collection('secure').doc(eventId), {
        participant: firebase.firestore.FieldValue.arrayRemove(this.user.id),
      })
    })

    batch.delete(userDocRef)

    const storageRef = firebase
      .storage()
      .ref()
      .child(this.user.id)
      .child('event')
    try {
      await storageRef
        .listAll()
        .then((result) => {
          result.items.forEach((file) => {
            file.delete()
          })
        })
        .catch((error) => {
          console.log(error)
          throw new Error(error)
        })

      await batch
        .commit()
        .catch()
        .then(() => {})
        .catch((error) => {
          throw new Error(error)
        })

      const user: any = firebase.auth().currentUser
      user
        .delete()
        .then(() => {
          userStore.logout()
          alert('退会に成功しました。')
          location.reload()
        })
        .catch((error: any) => {
          throw new Error(error)
        })
    } catch (error) {
      console.log(error)
      alert('退会処理に失敗しました。')
    }
  }

  logout() {
    userStore.logout()
  }

  login() {
    const thisClass = this

    firebase.auth().languageCode = 'ja'
    const provider = new firebase.auth.TwitterAuthProvider()
    firebase
      .auth()
      .signInWithPopup(provider)
      .then(function (result) {
        const user = result.user

        let username = ''
        if (
          result.additionalUserInfo !== null &&
          result.additionalUserInfo !== undefined
        ) {
          username = result.additionalUserInfo.username || ''
        }

        if (user !== null) {
          const twitterData: any = user.providerData[0]
          const loginedUser = {
            id: user.uid || '',
            displayName: twitterData.displayName || '',
            photoURL: twitterData.photoURL || '',
            username,
          }

          thisClass.user = loginedUser

          userStore.login(loginedUser)
        }
      })
      .catch(function (error) {
        const errorMessage = error.message
        console.log(errorMessage)
      })
  }
}
</script>

<style lang="scss" scoped>
.title-font {
  color: white;
  cursor: pointer;
  font-size: 1.5rem;
  font-weight: 800;
}

.content {
  background-color: #f7f9fd;
}

.btn-title {
  color: white;
  font-size: 1rem;
  font-weight: bold;
}
</style>
