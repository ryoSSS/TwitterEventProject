<template>
  <div>
    <v-card>
      <v-card-title> 作成したイベント</v-card-title>
      <v-list>
        <template v-for="event in ownerEventInfo">
          <div :key="event.id">
            <v-divider />
            <v-list-item :key="event.id" :to="'/event/' + event.id">
              <v-list-item-content>
                <v-list-item-title>{{ event.title }}</v-list-item-title>
              </v-list-item-content>
              <v-spacer />
            </v-list-item>
          </div>
        </template>
      </v-list>
    </v-card>
    <v-card style="margin-top: 20px">
      <v-card-title> 参加しているイベント</v-card-title>

      <v-list>
        <template v-for="event in participantEventInfo">
          <div :key="event.id">
            <v-divider />
            <v-list-item :to="'/event/' + event.id">
              <v-list-item-content>
                <v-list-item-title>{{ event.title }}</v-list-item-title>
              </v-list-item-content>
              <v-spacer />
            </v-list-item>
          </div>
        </template>
      </v-list>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'nuxt-property-decorator'
import firebase from 'firebase/app'
import { EventRoot, UserRoot } from '~/plugins/firebase'
import { userStore } from '~/store'

@Component
export default class EVENT_ID extends Vue {
  id = ''
  participantEventInfo: any = []
  ownerEventInfo: any = []
  user = {
    id: userStore.id,
    ownerEvent: [],
    participantEvent: [],
  }

  async mounted() {
    this.id = this.$route.params.id
    const userDocRef = UserRoot.doc(this.id)
    const userDoc = await userDocRef.get()
    const userData = userDoc.data()

    if (userData === undefined) return

    this.user = {
      id: userData.id,
      ownerEvent: userData.ownerEvent,
      participantEvent: userData.participantEvent,
    }

    this.user.ownerEvent.forEach(async (eventId) => {
      const eventDoc = await EventRoot.doc(eventId).get()
      if (eventDoc.exists) {
        const eventData = eventDoc.data()
        this.ownerEventInfo = [...this.ownerEventInfo, eventData]
      } else {
      }
    })

    this.user.participantEvent.forEach(async (eventId) => {
      const eventDoc = await EventRoot.doc(eventId).get()
      if (eventDoc.exists) {
        const eventData = eventDoc.data()
        this.participantEventInfo = [...this.participantEventInfo, eventData]
      } else if (userStore.id === this.user.id) {
        await userDocRef.update({
          participantEvent: firebase.firestore.FieldValue.arrayRemove(eventId),
        })
      }
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
