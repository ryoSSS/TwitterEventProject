<template>
  <div>
    <client-only>
      <v-card>
        <v-card-title> {{ title }} </v-card-title>
        <v-card-text>{{ content }}</v-card-text>

        <v-container fluid>
          <v-row class="d-flex justify-center" style="margin-bottom: 20px">
            <template
              v-if="
                state == 'applicant' && participant.length < maxParticipants
              "
            >
              <v-btn color="secondary" @click="handleJoinEvent">
                <span class="btn-title">参加する</span>
              </v-btn>
            </template>

            <template v-if="state == 'participant'">
              <v-btn color="accent" @click="handleCancelEvent">
                <span class="btn-title">参加を取り消す</span>
              </v-btn>
            </template>

            <template v-if="state == 'owner'">
              <v-btn target="_blank" color="#00ACEE" :href="tweetURL">
                <v-icon size="25" color="#fff" left>mdi-twitter</v-icon>
                <span class="btn-title">メンバーを募集する</span>
              </v-btn>
            </template>
          </v-row>
          <template v-if="state == 'participant' || state == 'owner'">
            <v-divider />
            <v-row>
              <v-col cols="12"> 参加者へのお知らせ<br /><br /> </v-col>
              <v-col v-if="!editting" cols="12">
                {{ infomation }}
              </v-col>
              <v-col v-else cols="12">
                <v-textarea
                  v-model="newInfomation"
                  auto-grow
                  rows="6"
                  outlined
                  label="お知らせの内容"
                />
              </v-col>
            </v-row>
          </template>
          <v-row
            class="d-flex justify-center"
            style="margin-bottom: 20px; margin-top: 20px"
          >
            <template v-if="state == 'owner'">
              <v-btn
                v-if="!editting"
                color="accent"
                @click.stop="
                  editting = true
                  newInfomation = infomation
                "
              >
                <span class="btn-title">編集する</span>
              </v-btn>
              <template v-else>
                <v-spacer />
                <v-btn color="warning" @click.stop="editting = false">
                  <span class="btn-title">キャンセル</span>
                </v-btn>
                <v-spacer />
                <v-btn color="success" @click.stop="handleUpdateInfomation">
                  <span class="btn-title">保存する</span>
                </v-btn>
                <v-spacer />
              </template>
            </template>
          </v-row>
          <v-divider />
          <v-row>
            <v-col cols="12">
              <v-list>
                主催者
                <v-list-item @click="handleOnUser(owner.username)">
                  <v-list-item-avatar>
                    <v-img :src="owner.photoURL" />
                  </v-list-item-avatar>

                  <v-list-item-content>
                    <v-list-item-title>{{
                      owner.displayName
                    }}</v-list-item-title>
                  </v-list-item-content>
                  <v-spacer />
                </v-list-item>
              </v-list>
            </v-col>
            <v-col cols="12">
              <v-list>
                参加者 {{ participant.length }}/{{ maxParticipants }}

                <v-list-item
                  v-for="user in participant"
                  :key="user.id"
                  @click="handleOnUser(user.username)"
                >
                  <v-list-item-avatar>
                    <v-img :src="user.photoURL" />
                  </v-list-item-avatar>

                  <v-list-item-content>
                    <v-list-item-title>{{
                      user.displayName
                    }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
      <template v-if="state == 'owner'">
        <v-row class="d-flex justify-center" style="margin-top: 20px">
          <v-btn color="warning" @click.stop="handleDeleteEvent">
            <span class="btn-title">イベントを削除する</span>
          </v-btn>
        </v-row>
      </template>
      <v-dialog v-model="dialog" width="500">
        <v-card>
          <v-card-title>ログイン</v-card-title>
          <v-card-text class="d-flex justify-center">
            <v-btn
              style="text-transform: none; color: white"
              color="#00acee"
              @click="login"
            >
              <v-icon size="25" color="white" left>mdi-twitter</v-icon>
              Twitterでログイン
            </v-btn>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn color="red" text @click="dialog = false"> やめる </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </client-only>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'nuxt-property-decorator'
import firebase from 'firebase/app'
import { UserRoot, EventRoot, db } from '~/plugins/firebase'
import { userStore } from '~/store'

let id = ''
let participantNumber = 0
let photoURL = ''
let photoName = ''
let maxParticipants = ''
let title = ''
let content = ''
let participantIdArray: string[] = []
let ownerId = ''

@Component
export default class EVENT_ID extends Vue {
  async asyncData({ route }: any) {
    const eventDoc = await EventRoot.doc(route.params.id).get()
    const eventData = eventDoc.data()
    if (eventData !== undefined) {
      id = eventData.id
      participantNumber = eventData.participantNumber
      photoURL = eventData.photoURL
      photoName = eventData.photoName
      maxParticipants = eventData.maxParticipants
      title = eventData.title
      content = eventData.content
      participantIdArray = eventData.participant
      ownerId = eventData.owner
    }
  }

  head() {
    return {
      meta: [
        { hid: 'og:type', property: 'og:type', content: 'article' },
        {
          hid: 'og:image',
          property: 'og:image',
          content: photoURL,
        },
        {
          hid: 'og:title',
          property: 'og:title',
          content: title,
        },
        {
          hid: 'og:description',
          property: 'og:description',
          content: '',
        },
        {
          name: 'twitter:card',
          content: 'summary_large_image',
        },
        {
          name: 'twitter:image',
          content: photoURL,
        },
      ],
    }
  }

  participantNumber = participantNumber
  participant: any = []
  id = id
  photoURL = photoURL
  photoName = photoName
  owner = {
    id: '',
    displayName: '',
    photoURL: '',
    username: '',
  }

  participantIdArray = participantIdArray
  ownerId = ownerId
  maxParticipants = maxParticipants
  createdAt = ''
  updatedAt = ''
  title = title
  content = content
  infomation = ''
  state = 'applicant'
  newInfomation = ''
  editting = false
  dialog = false
  user = {
    id: userStore.id,
    displayName: userStore.displayName,
    photoURL: userStore.photoURL,
    username: userStore.username,
  }

  get tweetURL(): string {
    return (
      'http://twitter.com/share?related=@twibo_app&hashtags=ツイ募&text=' +
      this.title +
      'のメンバーを募集中です！' +
      '&url=' +
      process.env.BASE_URL +
      this.$route.fullPath
    )
  }

  get LoginedUser() {
    return userStore.id
  }

  @Watch('state')
  async onChangeState() {
    if (this.state === 'owner' || this.state === 'participant') {
      const eventSecureDoc = await EventRoot.doc(this.id)
        .collection('secure')
        .doc(this.id)
        .get()

      const eventData = eventSecureDoc.data()

      if (eventData === undefined) return
      this.infomation = eventData.infomation
    }
  }

  @Watch('LoginedUser')
  onChangeUser() {
    this.user = userStore

    if (this.user.id === '') {
      this.state = 'applicant'
      return
    }

    this.participant.some((user: any) => {
      if (user.id === userStore.id) {
        this.state = 'participant'
        return true
      }
    })

    if (this.owner.id === userStore.id) {
      this.state = 'owner'
    }
  }

  async handleDeleteEvent() {
    const userDocRef = UserRoot.doc(this.user.id)
    const eventDocRef = EventRoot.doc(this.id)
    const eventSecureDocRef = eventDocRef.collection('secure').doc(this.id)

    const batch = db.batch()

    batch.update(userDocRef, {
      ownerEvent: firebase.firestore.FieldValue.arrayRemove(this.id),
    })

    batch.delete(eventDocRef)
    batch.delete(eventSecureDocRef)

    await batch
      .commit()
      .catch()
      .then(() => {
        const storageRef = firebase
          .storage()
          .ref()
          .child(this.user.id)
          .child(this.photoName)
        storageRef
          .delete()
          .then(() => {})
          .catch((error) => {
            console.log(error)
          })
        alert('イベントを削除しました。')
        location.reload()
      })
      .catch(() => alert('イベント削除に失敗しました。'))
  }

  async handleUpdateInfomation() {
    const eventSecureDocRef = EventRoot.doc(this.id)
      .collection('secure')
      .doc(this.id)
    await eventSecureDocRef
      .update({ infomation: this.newInfomation })
      .then(() => {
        alert('保存に成功しました!')
        this.infomation = this.newInfomation
        this.editting = false
      })
      .catch((err: string) => {
        alert('保存に失敗しました')
        console.log(err)
      })
  }

  async login() {
    const thisClass = this

    firebase.auth().languageCode = 'ja'
    const provider = new firebase.auth.TwitterAuthProvider()
    await firebase
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

    if (this.user.id !== '') {
      this.handleJoinEvent()
    }
  }

  async handleCancelEvent() {
    const eventDocRef = EventRoot.doc(this.id)
    const userDocRef = UserRoot.doc(this.user.id)
    const batch = db.batch()

    batch.update(eventDocRef, {
      participant: firebase.firestore.FieldValue.arrayRemove(this.user.id),
    })
    batch.update(userDocRef, {
      participantEvent: firebase.firestore.FieldValue.arrayRemove(this.id),
    })

    await batch
      .commit()
      .catch()
      .then(() => {
        alert('イベントをキャンセルしました。')
        location.reload()
      })
      .catch(() => alert('イベントキャンセルに失敗しました。'))
  }

  async handleJoinEvent() {
    if (this.participant.length >= this.maxParticipants) {
      alert('応募人数が限界です')
      return
    }

    if (this.user.id === '') {
      this.dialog = true
      return
    }

    let isOwner = false

    if (this.owner.id === this.user.id) {
      isOwner = true
    }

    const isParticipant: boolean = this.participant.some((user: any) => {
      if (user.id === this.user.id) {
        return true
      }
    })

    if (isOwner || isParticipant) {
      alert('参加済みです')
      return
    }

    const eventDocRef = EventRoot.doc(this.id)
    const userDocRef = UserRoot.doc(this.user.id)

    const batch = db.batch()

    batch.update(eventDocRef, {
      participant: firebase.firestore.FieldValue.arrayUnion(this.user.id),
    })
    batch.update(userDocRef, {
      participantEvent: firebase.firestore.FieldValue.arrayUnion(this.id),
    })
    batch.update(eventDocRef.collection('secure').doc(this.id), {
      participant: firebase.firestore.FieldValue.arrayUnion(this.user.id),
    })
    await batch
      .commit()
      .catch()
      .then(() => {
        alert('イベントに参加しました。')
        location.reload()
      })
      .catch((error) => {
        alert('イベントの参加に失敗しました。')
        console.log(error)
      })
  }

  handleOnUser(username: string) {
    const url = 'https://twitter.com/' + username
    window.open(url, '_blank')
  }

  async mounted() {
    if (this.id === '') {
      this.id = this.$route.params.id

      const eventDoc = await EventRoot.doc(this.id).get()
      const eventData = eventDoc.data()

      if (eventData === undefined) return

      this.participantNumber = eventData.participantNumber
      this.photoURL = eventData.photoURL
      this.photoName = eventData.photoName
      this.maxParticipants = eventData.maxParticipants
      this.title = eventData.title
      this.content = eventData.content

      this.participantIdArray = eventData.participant
      this.ownerId = eventData.owner
    }

    const ownerDoc = await UserRoot.doc(this.ownerId).get()
    const ownerData = ownerDoc.data()
    if (ownerData !== undefined) {
      this.owner = {
        id: ownerData.id,
        displayName: ownerData.displayName,
        photoURL: ownerData.photoURL,
        username: ownerData.username,
      }
    }
    if (this.owner.id === userStore.id) {
      this.state = 'owner'
    }

    await this.participantIdArray.forEach(async (userId: any) => {
      const userDoc = await UserRoot.doc(userId).get()

      const userData: any = userDoc.data()
      if (userData.id === userStore.id) {
        this.state = 'participant'
      }
      this.participant = [...this.participant, userDoc.data()]
    })
  }
}
</script>

<style lang="scss" scoped>
/* 画像のアスペクト比は固定なので、あらかじめ高さをCSSで調整 */
.preview-wrapper {
  position: relative;
  width: 100%;
  height: auto;
}

.preview-wrapper {
  &:before {
    content: '';
    display: block;
    padding-top: 52.5%; /* 630 / 1200 x 100 */
  }
}

.preview-content {
  position: absolute;
  top: 0;
  left: 0;
}

.btn-title {
  color: white;
  font-size: 1rem;
  font-weight: bold;
}
</style>
