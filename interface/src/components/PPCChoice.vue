<template>
  <div class="basket">
    <!-- For key and value in this.basket -->
    <div class="basket-item" v-for="{ formula, amount } in basket">
      <p>- {{ amount }} x {{ formula }}€</p>
    </div>
    <p>TOTAL: {{ total }}€</p>
  </div>

  <header>
    <h1>Choix du PPC</h1>
    <p class="error-field">{{ error }}</p>
  </header>

  <main>
    <div class="amount-input" v-show="stage === Stage.AMOUNT">
      <div class="amount-wrapper">
        <p>Quelle quantité ?</p>
        <input type="text" v-model="amount" id="amount-input" />
      </div>
    </div>

    <div class="row">
      <div class="key-wrapper">
        <p>1</p>
        <div class="dot" />
      </div>

      <div class="image-wrapper">
        <img :src="smallFruitImage" alt="Small Fruit" />
      </div>

      <p>Formule à 5€</p>
    </div>

    <div class="row">
      <div class="key-wrapper">
        <p>2</p>
        <div class="dot" />
      </div>

      <div class="image-wrapper">
        <img :src="bigFruitImage" alt="Big Fruit" />
      </div>

      <p>Formule à 7.50€</p>
    </div>

    <h6>Appuyer sur <span>V</span> pour confirmer, <span>A</span> pour annuler</h6>
  </main>
</template>

<script>
const Stage = {
  CHOICE: 'CHOICE',
  AMOUNT: 'AMOUNT'
};

export default {
  name: 'PPCChoice',
  data() {
    return {
      smallFruitImage: '',
      bigFruitImage: '',
      error: '',
      amount: '',

      stage: Stage.CHOICE,
      currentFormula: null,
      basket: [],

      Stage: Stage // Used to access the Stage enum from the template
    }
  },
  computed: {
    total() {
      return this.basket.reduce((acc, { formula, amount }) => {
        return acc + formula * amount;
      }, 0);
    }
  },
  mounted() {
    const amountInput = document.getElementById('amount-input');

    // Random number between 0 and 4 included and pad it with 0
    const randomSmallFruit = Math.floor(Math.random() * 5).toString().padStart(2, '0');
    const randomBigFruit = Math.floor(Math.random() * 5).toString().padStart(2, '0');

    // Display random fruits
    this.smallFruitImage = `/fruits/small/small_${randomSmallFruit}.svg`;
    this.bigFruitImage = `/fruits/big/big_${randomBigFruit}.svg`;

    const handleKeyPress = (event) => {
      // If the user is choosing their formula
      if (this.stage === Stage.CHOICE) {

        // You really need to unfocus, god I hate web browsers
        amountInput.blur();

        // If the key is '1' or '2', set the formula
        if (event.key === '1' || event.key === '2') {
          switch (event.key) {
            case '1':
              this.currentFormula = 5;
              break;
            case '2':
              this.currentFormula = 7.5;
              break;
          }

          this.stage = Stage.AMOUNT;

          // Focus the amount input, they have no mouse
          window.setTimeout(() => {
            amountInput.focus();
          }, 0);
        }
        // If the key is Backspace, cancel the order
        else if (event.key === 'Backspace') {
          this.$store.dispatch('resetData');
        }
        // If the key is Enter, go to the confirmation page
        else if (event.key === 'Enter') {

          // Remove event listener
          document.removeEventListener('keypress', handleKeyPress);
          
          if (this.basket.length === 0) {
            this.$router.push('/');
            return;
          }

          // Set the chosen PPC
          this.$store.commit('setPpcChoice', this.basket);

          this.$router.push('/confirmation');
        }
      }
      // If the user chose a formula and is entering the amount
      else if (this.stage === Stage.AMOUNT) {

        // If enter, add to basket
        if (event.key === 'Enter') {
          const amount = parseInt(this.amount);
          if (amount > 0) {
            const index = this.basket.findIndex(({ formula }) => formula === this.currentFormula);
            if (index !== -1) {
              this.basket[index].amount += amount;
            } else {
              this.basket.push({
                formula: this.currentFormula,
                amount: amount
              });
            }
          }

          this.stage = Stage.CHOICE;

          this.amount = '';
          this.currentFormula = null;
        }
        // If backspace, reset
        else if (event.key === 'Backspace') {
          this.stage = Stage.CHOICE;
          this.amount = '';
          this.currentFormula = null;
        }
      }
    };

    document.addEventListener('keypress', handleKeyPress);
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
  align-items: center;
  justify-content: center;
  height: 66vh;

  width: 100%;
  position: relative;
}

main>img {
  height: 50%;
  width: auto;
}

main>p {
  margin-top: 2em;
  font-size: 1.3em;
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

.row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  width: 60%;
  margin-bottom: 2em;
}

.row>p {
  font-size: 1.2em;
  width: 8em;
}

.row:last-of-type {
  margin-bottom: 0;
}

.key-wrapper {
  margin-right: 1em;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.key-wrapper>p {
  font-size: 2em;
  font-weight: bold;
}

.dot {
  width: .5em;
  height: .5em;
  border-radius: 50%;
  background-color: black;
  margin-left: .2em;
}

.amount-input {
  position: absolute;
  background-color: var(--background-color);

  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;
}

.amount-wrapper {
  margin-top: 4em;
}

.amount-wrapper>p {
  margin-bottom: 0;
  padding-left: 0.3em;
  font-size: 1.2em;
}

.amount-wrapper>input {
  width: 15em;
  height: 1.2em;
  padding: 0.7em 1em;
}

.basket {
  position: absolute;
  top: 0;
  left: 0;

  padding: 1em;
}

.basket p {
  margin: 0;
  padding: 0;

  height: 1.7em;
}

.basket>p {
  font-weight: bold;
}

h6 {
  margin-top: 3em;
  font-weight: normal;
  margin-bottom: 0;
}

h6>span {
  font-weight: 700;
}
</style>