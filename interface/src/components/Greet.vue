<template>
  <img src="../assets/logo_glc.svg" />
  <h1>Appuyez sur le bouton vert pour commencer</h1>
</template>

<script>
export default {
    name: 'Badge-Scan',
    mounted() {
        const backup = document.onkeypress;

        const wakeUp = (event) => {
            event = event || window.event;

            // 13 == <Enter>
            if (event.keyCode === 13) {
                document.onkeypress = backup;
                this.$router.push('/badge-scan')
            }
        }

        // Wait for user to press <Enter>
        document.onkeypress = wakeUp;
    }
}
</script>

<style scoped>
img {
    height: 40vh;
    width: auto;

    animation-name: rotate;
    animation-duration: 10s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
}

h1 {
    width: 50vw;
    text-align: center;
    margin-top: 5%;
    text-transform: uppercase;
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
</style>
