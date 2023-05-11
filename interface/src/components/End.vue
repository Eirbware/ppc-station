<template>
    <header>
        <h1>Merci !</h1>
    </header>

    <main>
        <img :src="endImage" alt="End" />
        <p>Ta commande a bien été prise en compte !</p>
    </main>
</template>

<script>
export default {
    name: 'End',
    data() {
        return {
            endImage: ''
        }
    },
    mounted() {
        // Random number between 0 and 1 and pad it with 0
        const random = Math.floor(Math.random() * 2).toString().padStart(2, '0');

        this.endImage = `/end/end_${random}.svg`;

        setTimeout(() => {
            this.$store.dispatch('resetData');
            this.$router.push('/');
        }, 5000);
    }
}
</script>

<style scoped>
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