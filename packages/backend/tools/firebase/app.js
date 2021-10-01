const template = `
<div>
  <div v-if="!token && !loading">
    <div>
      <input type="text" v-model="form.email" placeholder="Email" />
    </div>
    <div>
      <input type="text" v-model="form.password" placeholder="Password" />
    </div>

    <button type="button" @click="handleLogin">Login</button>
  </div>

  <div v-else>
    <div>Logged in with: {{ user.email }}, displayName: {{ user.displayName }}</div>
    <button type="button" @click="handleLogout">Logout</button>
  </div>

  <div>
    <br />
    <span>accessToken:</span>
    <br />
    <code>{{ token }}</code>
  </div>
</div>
`

window.onload = () => {
  const App = {
    template,
    setup() {
      const loading = Vue.ref(true)
      const token = Vue.ref()
      const form = Vue.ref({
        email: 'admin@ltv.dev',
        password: 'Admin@1234',
      })
      const user = Vue.ref({})

      firebase.initializeApp({
        apiKey: 'AIzaSyCEBdy3Yw6OupV6R7aUwUd0w5q9Cdr_hr4',
        projectId: 'moleculer-boilerplate-ts',
      })
      firebase.auth().onAuthStateChanged(async (authenticatedUser) => {
        if (!authenticatedUser) {
          token.value = ''
          user.value = {}
        }
        const idToken = await authenticatedUser.getIdToken(true)
        token.value = idToken
        user.value = authenticatedUser
      })

      Vue.onMounted(() => {
        loading.value = false
      })

      const handleLogin = async () => {
        loading.value = true
        firebase
          .auth()
          .signInWithEmailAndPassword(form.value.email, form.value.password)
          .then(() => (loading.value = false))
          .catch((error) => {
            console.error(error)
          })
      }

      const handleLogout = async () => {
        firebase.auth().signOut()
      }

      return { token, user, form, handleLogin, handleLogout, loading }
    },
  }

  Vue.createApp(App).mount('#app')
}
