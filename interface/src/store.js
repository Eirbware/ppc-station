import {createStore} from 'vuex';
import createPersistedState from 'vuex-persistedstate';
import SecureLS from 'secure-ls';
import {invoke} from "@tauri-apps/api/tauri";

const ls = new SecureLS({
    encodingType: 'aes',
    isCompression: false,
});

const store = createStore({
    state() {
        return {
            user: null,
            ppcChoice: null,
            audio: null
        }
    },
    mutations: {
        setUser(state, user) {
            state.user = user;
        },
        setPpcChoice(state, ppcChoice) {
            state.ppcChoice = ppcChoice;
        },
        setAudio(state, audio) {
            state.audio = audio;
        }
    },
    actions: {
        resetData({commit}) {
            commit('setUser', null);
            commit('setPpcChoice', null);
            commit('setAudio', null);
        },
        playAudio({commit, state}, audio) {
            if (state.audio !== null) {
                invoke("kill_audio", {pid: state.audio});
            }

            invoke("play_audio", {path: audio})
                .then(result => commit('setAudio', result))
                .catch(err => invoke("console_log", {message: err}));
        },
        stopAudio({commit, state}) {
            if (state.audio) {
                invoke("kill_audio", {pid: state.audio}).then(() => {
                    commit('setAudio', null);
                }).catch(err => invoke("console_log", {message: err}));

            }
        }
    },
    plugins: [createPersistedState({
        storage: {
            getItem: key => ls.get(key),
            setItem: (key, value) => ls.set(key, value),
            removeItem: key => ls.remove(key),
        },
    })],
});

export default store;