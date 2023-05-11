<template>
  <header>
    <h1>Scan</h1>
    <p class="error-field">{{ error }}</p>
  </header>

  <main v-if="!data">
    <img src="../assets/card.svg" alt="Scan" />
    <p>Veuillez présenter votre carte étudiante</p>
  </main>

  <main v-else>
    <img :src="greetingImage" alt="Greeting" />
    <p>Bienvenue, {{ data }}</p>
  </main>
</template>

<script>
import { invoke } from '@tauri-apps/api/tauri'

export default {
  name: 'Scan',
  data() {
    return {
      data: '',
      error: '',
      greetingImage: ''
    }
  },
  async mounted() {
    const getStudentInformations = () => {
      invoke("read_mifare", { port: "/dev/ttyACM0" }).then((data) => {
        this.error = '';

        invoke("fetch_from_ldap", { mifare: data.data.replace(/(\r\n|\n|\r)/gm, "") }).then((data) => {
          /*
            struct LdapData {
              given_name: String,
              sn: String,
              mail: String,
              uid: String,
            }
          */

          this.error = '';
          this.data = data.given_name;
          this.$store.commit('setUser', data);

          // Random number between 1 and 2 and pad it with 0
          const random = Math.floor(Math.random() * 2).toString().padStart(2, '0');

          this.greetingImage = `/greetings/greetings_${random}.svg`;

          this.$store.dispatch('stopAudio');

          setTimeout(() => {
            this.$router.push('/ppc-choice');
          }, 3000);
        });
      }).catch((error) => {
        this.error = error;

        getStudentInformations();
      });
    }

    const getStudentInformationsDebug = () => {
      invoke("fetch_from_ldap", { mifare: "041641AA1A7280" }).then((data) => {
        /*
          struct LdapData {
            given_name: String,
            sn: String,
            mail: String,
            uid: String,
          }
        */

        this.error = '';
        this.data = data.given_name;
        this.$store.commit('setUser', data);

        // Random number between 1 and 2 and pad it with 0
        const random = Math.floor(Math.random() * 2).toString().padStart(2, '0');

        this.greetingImage = `/greetings/greetings_${random}.svg`;

        this.$store.dispatch('stopAudio');

        setTimeout(() => {
          this.$router.push('/ppc-choice');
        }, 3000);
      }).catch((error) => {
        this.error = error;

        getStudentInformationsDebug();
      });
    }

    // getStudentInformationsDebug();
    getStudentInformations();
  }
};
</script>

<style scoped>
.error-field {
  color: red;
}

header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 20vh;
}

header>h1 {
  margin-bottom: 0;
}

header>p {
  margin-top: 0;
}

main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 66vh;
}

main>img {
  height: 50%;
  width: auto;
}

main>p {
  margin-top: 2em;
  font-size: 1.3em;
}
</style>
