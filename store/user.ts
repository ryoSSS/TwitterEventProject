import { VuexModule, Module, Mutation, Action } from 'vuex-module-decorators'
import { authActions, UserRoot } from '~/plugins/firebase'

@Module({ stateFactory: true, namespaced: true, name: 'user' })
export default class User extends VuexModule {
  public id = ''
  public displayName = ''
  public photoURL = ''
  public username = ''

  @Mutation
  SET_USER_STATE(user: any) {
    this.id = user.id
    this.displayName = user.displayName
    this.photoURL = user.photoURL
    this.username = user.username
  }

  @Action({ rawError: true })
  async login(user: any) {
    if (user.id === '') return
    const userDocRef = UserRoot.doc(user.id)
    const currentDate: Date = new Date()
    const loginedUser: any = {
      id: user.id,
      photoURL: user.photoURL,
      displayName: user.displayName,
      username: user.username,
      loginAt: currentDate,
    }

    const userDoc = await userDocRef.get()
    const userData: any = userDoc.data()

    if (userDoc.exists) {
      await userDocRef.update(loginedUser)

      user.ownerEvent = userData.ownerEvent
      user.participateEvent = userData.participateEvent
    } else {
      loginedUser.ownerEvent = []
      loginedUser.participantEvent = []
      await userDocRef.set(loginedUser)
    }

    this.context.commit('SET_USER_STATE', user)
  }

  @Action
  async logout() {
    await authActions.logout()
    const user: any = {
      id: '',
      displayName: '',
      photoURL: '',
    }
    this.context.commit('SET_USER_STATE', user)
  }
}
