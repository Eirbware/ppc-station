<template>
    <header>
        <h1>Confirmation</h1>
        <p class="error-field">{{ error }}</p>
    </header>

    <main>
        <img src="/question_mark.svg" alt="Point d'interrogation" />
        <p>Bon {{ user.given_name }}, résumons:</p>
        <ul>
            <li v-for="item in ppc" :key="item.formula">
                {{ item.amount }} x Formule à {{ item.formula }} €
            </li>
        </ul>
        <p>Soit un total de {{ ppc.reduce((acc, curr) => acc += (curr.amount * parseFloat(curr.formula)), 0) }} €</p>
        <h6>Appuyer sur <span>V</span> pour confirmer, <span>A</span> pour annuler</h6>
    </main>
</template>

<script>
export default {
    name: 'Confirmation',
    data() {
        return {
            error: ''
        };
    },
    mounted() {
        const handleKeyPress = (event) => {
            // If key is not Enter or Backspace, return
            if (event.key !== 'Enter' && event.key !== 'Backspace') {
                return;
            }

            document.removeEventListener('keypress', handleKeyPress);

            if (event.key === 'Enter') {
                this.$router.push('/end');
            } else if (event.key === 'Backspace') {
                this.$router.push('/');
            }
        }

        document.addEventListener('keypress', handleKeyPress);
    },
    computed: {
        user() {
            if (this.$store.state.user) {
                return this.$store.state.user;
            }

            return {
                given_name: 'Utilisateur'
            };
        },
        ppc() {
            const processedResult = this.$store.state.ppcChoice.reduce((acc, curr) => {
                if (acc[curr.formula]) {
                    acc[curr.formula] += curr.amount;
                } else {
                    acc[curr.formula] = curr.amount;
                }

                return acc;
            }, {});

            // Dict to array
            return Object.keys(processedResult).map((key) => {
                return {
                    formula: key,
                    amount: processedResult[key]
                };
            });
        }
    }
}
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
    justify-content: flex-start;
    height: 66vh;

    width: 100%;
    text-align: center;
}

main>img {
    height: 20%;
    width: auto;
    margin-top: 1em;
}

main>p {
    margin-top: 1em;
    font-size: 1.3em;
    margin-bottom: 0;
}

main>p:last-of-type {
    margin-top: 0.2em;
}

.image-wrapper {
    width: 20vh;
    height: 20vh;
    margin-right: 1em;
}

.image-wrapper>img {
    width: 100%;
    height: 100%;
}

ul {
    padding: 0;
    margin: 0;
}

h6 {
    margin-top: 0;
    font-weight: normal;
}

h6>span {
    font-weight: 700;
}
</style>