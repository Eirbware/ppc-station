<template>
    <img src="../assets/logo_glc.svg" />
    <h1>Appuyez sur le bouton vert pour commencer</h1>
</template>

<script>
import { invoke } from '@tauri-apps/api/tauri'

export default {
    name: 'Badge-Scan',
    mounted() {
        this.$store.dispatch('resetData');

        const handleKeyPress = (event) => {
            event = event || window.event;

            // 13 == <Enter>
            if (event.code === 'Enter') {
                document.removeEventListener('keypress', handleKeyPress);
                // Load /tahir_welcome.mp3 and play it
                this.$store.dispatch('playAudio', '../tahir_welcome.mp3');
                this.$router.push('/badge-scan')
            }
        }

        document.addEventListener('keypress', handleKeyPress);
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

@keyframes rotate-reverse {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
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
