<template>
  <div>
    <v-card>
      <script
        async
        src="https://platform.twitter.com/widgets.js"
        charset="utf-8"
      ></script>
      <v-card-title> イベントを作成 </v-card-title>
      <v-container fluid>
        <v-row>
          <v-col cols="12">
            Twitterに投稿する画像

            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn small icon v-bind="attrs" v-on="on">
                  <v-icon color="secondary">mdi-information-outline</v-icon>
                </v-btn>
              </template>
              <span
                >・ログイン後、左下のアイコンはあなたのTwitterアイコンになります。<br />
              </span>
            </v-tooltip>
          </v-col>

          <v-col cols="12">
            <client-only>
              <div id="preview-wrapper" class="preview-wrapper">
                <v-stage
                  ref="stage"
                  :config="configKonva"
                  class="preview-content"
                  :style="style"
                >
                  <v-layer>
                    <v-image :config="configBg"></v-image>
                  </v-layer>
                  <v-layer>
                    <v-group :config="configUserImageGroup">
                      <v-image :config="configUserImg"></v-image>
                    </v-group>
                  </v-layer>
                  <v-layer>
                    <v-text :config="configTitle"></v-text>
                  </v-layer>
                  <v-layer>
                    <v-text :config="configContent"></v-text>
                  </v-layer>
                </v-stage>
              </div>
            </client-only>
          </v-col>

          <v-col cols="12">
            <v-text-field v-model="title" outlined dense label="イベント名">
            </v-text-field>

            <v-textarea v-model="content" outlined label="イベントの内容" />
          </v-col>
        </v-row>
        <v-divider />
        <v-row>
          <v-col>
            募集設定

            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn small icon v-bind="attrs" v-on="on">
                  <v-icon color="secondary">mdi-information-outline</v-icon>
                </v-btn>
              </template>
              <span>・イベントの募集人数を決定します。 <br /> </span>
            </v-tooltip>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="maxParticipants"
              dense
              outlined
              label="募集人数 (最大10)"
              suffix="人"
              oninput="if(Number(this.value) > Number(10)) this.value = 10;if(Number(this.value) < Number(0)) this.value = 1;"
              type="number"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-radio-group v-model="eligibleApplicant" column>
              <!--
              <v-radio
                label="先着だれでも"
                color="secondary"
                value="anyone"
              ></v-radio>

              <v-radio
                label="先着フォロワーのみ"
                color="secondary"
                value="follower"
                disabled
              ></v-radio>
               -->
            </v-radio-group>
          </v-col>
        </v-row>

        <v-divider />
        <v-row>
          <v-col cols="12">
            参加者へのお知らせ
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn small icon v-bind="attrs" v-on="on">
                  <v-icon color="secondary">mdi-information-outline</v-icon>
                </v-btn>
              </template>
              <span
                >・このお知らせは、参加者のみが見れます。 <br />
                ・後からでも変更できます。
              </span>
            </v-tooltip>
          </v-col>
          <v-col cols="12" style="margin-bottom: -40px">
            <v-textarea
              v-model="info"
              auto-grow
              rows="6"
              outlined
              label="お知らせの内容"
            />
          </v-col>
          <!--
          <v-col class="d-flex justify-center" cols="12">
            <template v-if="!infoEditting">
              <v-btn color="accent" @click="infoEditting = true">
                <v-icon left>mdi-pencil</v-icon>
                <span class="btn-title">変更する</span>
              </v-btn>
            </template>
            <template v-else>
              <v-btn color="success" @click="infoEditting = false">
                <v-icon left>mdi-check</v-icon>
                <span class="btn-title">決定する</span>
              </v-btn>
            </template>
          </v-col>
          -->
        </v-row>
        <v-divider> </v-divider>
        <v-row class="d-flex justyfy-center" style="margin-top: 50px">
          <v-col class="d-flex justify-center" cols="12">
            <v-btn large color="secondary" @click.stop="handleCreateEvent">
              <span class="btn-title">イベントを作成</span>
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-card>
    <v-dialog v-model="dialog" width="500">
      <v-card>
        <v-card-title>ログイン後にイベントを作成します。</v-card-title>
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
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'nuxt-property-decorator'
import firebase from 'firebase/app'
import { EventRoot, UserRoot, db } from '~/plugins/firebase'
import { userStore } from '~/store'

const IMAGE_WIDTH = 1200
const IMAGE_HEIGHT = 627
const USER_IMAGE_SIZE = 110
const USER_IMAGE_X = 51
const USER_IMAGE_Y = 466

@Component
export default class Page extends Vue {
  private configKonva = { width: IMAGE_WIDTH, height: IMAGE_HEIGHT }
  private configBg: { image: HTMLImageElement | null } = { image: null }
  private configUserImg: any | null = null
  private scale: number = 0
  title: string = '例　オンライン勉強会'
  content: string = '例\n・毎日 朝8:00〜10:00\n・フォロワー以外も参加OK!!'
  eligibleApplicant = 'anyone'
  info = '例  8時になったらZoom 〇〇 に入ってください！'
  infoEditting = false
  maxParticipants = 1
  dialog = false
  user = {
    id: userStore.id,
    displayName: userStore.displayName,
    photoURL: userStore.photoURL,
  }

  eventURL = ''

  get LoginedUser() {
    return userStore.id
  }

  @Watch('LoginedUser')
  onChangeUser() {
    this.user = userStore
    this.setupUserImage()
  }

  async mounted() {
    await this.setupBg()
    await this.setupUserImage()

    // 初回のスケール計算処理を走らせる
    this.$nextTick(() => this.handleResize())
    // イベントリスナーにスケール計算処理を登録
    window.addEventListener('resize', this.handleResize)
  }

  async handleCreateEvent() {
    if (this.user.id === '') {
      this.dialog = true
      return
    }

    const batch = db.batch()

    const eventDocRef = EventRoot.doc()

    const eventSecureDocRef = eventDocRef
      .collection('secure')
      .doc(eventDocRef.id)

    const currentDate: Date = new Date()

    let photoURL = ''
    let photoName = ''
    try {
      await this.uploadImage(eventDocRef.id)
        .then((ImageValue: any) => {
          photoURL = ImageValue.photoURL
          photoName = ImageValue.photoName
        })
        .catch((error) => {
          throw new Error(error.message)
        })

      const newEventSocial: any = {
        participantNumber: 0,
        participant: [],
        id: eventDocRef.id,
        photoURL,
        photoName,
        owner: this.user.id,
        maxParticipants: this.maxParticipants,
        title: this.title,
        content: this.content,
        createdAt: currentDate,
        updatedAt: currentDate,
      }

      this.eventURL = eventDocRef.id

      const newEventSecure: any = {
        infomation: this.info,
        owner: this.user.id,
        participant: [],
      }

      batch.set(eventDocRef, newEventSocial)
      batch.set(eventSecureDocRef, newEventSecure)

      const userDocRef = UserRoot.doc(this.user.id)
      batch.update(userDocRef, {
        ownerEvent: firebase.firestore.FieldValue.arrayUnion(eventDocRef.id),
      })

      await batch
        .commit()
        .catch()
        .then(() => {
          this.$router.push({
            path: `/event/${eventDocRef.id}`,
          })
        })
        .catch((error) => {
          throw new Error(error)
        })
    } catch (error) {
      console.log(error)
      alert('イベントの作成に失敗しました。')
    }
  }

  private get configUserImageGroup() {
    return {
      // 複雑な切り取り処理: CanvasRenderingContext2Dのarcを使う
      clipFunc: (ctx: any) => {
        const r = USER_IMAGE_SIZE / 2
        ctx.arc(USER_IMAGE_X + r, USER_IMAGE_Y + r, r, 0, Math.PI * 2, false)
      },
      // ドラッグを無効にする
      draggable: false,
    }
  }

  private get configTitle() {
    return {
      // 表示する文字
      text: this.title,
      x: 200,
      y: 70,
      width: IMAGE_WIDTH - 400,
      fill: '#204495', // 文字の色
      fontSize: 65, // フォントサイズ
      fontFamily: 'Noto Sans JP', // フォントの種類
      fontStyle: 'bold', // フォントのスタイル
      align: 'center', // 揃え位置(中央揃え)
      // 折り返しなし(wrap)を指定すると、省略(ellipsis)を設定可能に
      wrap: 'none',
      ellipsis: true,
    }
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
      this.handleCreateEvent()
    }
  }

  private get configContent() {
    return {
      text: this.content,
      x: 150,
      y: 160,
      width: 900,
      height: 250,
      fill: '#333333',
      fontStyle: 'bold',
      fontSize: 40,
      fontFamily: 'Noto Sans JP',
      // 行の高さ
      lineHeight: 1.2,
    }
  }

  // ユーザ画像の読み込み処理: 本の画像とかとだいたい同じ

  private async setupUserImage() {
    let userImg =
      'https://pbs.twimg.com/profile_images/1302171026931949569/IB5B3x89_normal.jpg'
    if (this.user.photoURL !== '') {
      userImg = this.user.photoURL
    }
    const image = await this.getImage(userImg)

    this.configUserImg = {
      image,
      x: USER_IMAGE_X,
      y: USER_IMAGE_Y,
      width: USER_IMAGE_SIZE,
      height: USER_IMAGE_SIZE,
    }
  }

  beforeDestroy() {
    // Destroy前に解放
    window.removeEventListener('resize', this.handleResize)
  }

  private get style() {
    // transformのscaleを使って、サイズ調整
    return {
      transform: `scale(${this.scale})`,
      '-webkit-transform': `scale(${this.scale})`,
      'transform-origin': '0 0',
    }
  }

  // スケール計算用の処理: 対象IDのサイズを取得して、scaleを計算
  private handleResize() {
    const elm = document.getElementById('preview-wrapper')
    if (!elm) return
    const rect = elm.getBoundingClientRect()

    this.scale = rect.width / IMAGE_WIDTH
  }

  private async setupBg() {
    const image = await this.getImage('/twibo2.png')
    this.configBg.image = image
  }

  private getImage(src: string): Promise<HTMLImageElement> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return new Promise((resolve, reject) => {
      const image = new window.Image()
      image.setAttribute('crossOrigin', 'anonymous')
      image.onload = () => resolve(image)
      image.src = src
    })
  }

  uploadImage(fileName: string) {
    const thisClass = this
    return new Promise((resolve, reject) => {
      // stageの取得: 大きいサイズを取得するときは、'pixelRatio'で倍率を指定
      const stage = (thisClass.$refs.stage as any).getStage({ pixelRatio: 1 })

      // stageからDataURLを取得
      const dataURL = stage.toDataURL()
      const byteString = atob(dataURL.split(',')[1])
      const mimeType = dataURL.match(/(:)([a-z\/]+)(;)/)[2]
      const content = new Uint8Array(byteString.length)

      for (let i = 0; byteString.length > i; i++) {
        content[i] = byteString.charCodeAt(i)
      }
      const blob = new Blob([content], {
        type: mimeType,
      })

      const ref = firebase
        .storage()
        .ref()
        .child(this.user.id)
        .child('event')
        .child(fileName)

      ref
        .put(blob, {
          customMetadata: {
            owner: this.user.id,
          },
        })
        .then(() => {
          ref.getDownloadURL().then((url) => {
            resolve({ photoURL: url, photoName: ref.name })
          })
        })
        .catch((err) => {
          reject(err)
        })
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
