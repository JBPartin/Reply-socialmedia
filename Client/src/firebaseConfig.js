import firebase from 'firebase/app';
import { useState, useEffect } from 'react';
import 'firebase/auth';
import 'firebase/storage';
import 'firebase/firestore';
const base = !firebase.apps.length ? firebase.initializeApp({
    apiKey: process.env.REACT_APP_APIKEY,
    authDomain: process.env.REACT_APP_AUTHDOMAIN,
    projectId: process.env.REACT_APP_PROJECTID,
    storageBucket: process.env.REACT_APP_STORAGEBUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGINGSENDERID,
    appId: process.env.REACT_APP_APPID,
    measurementId: process.env.REACT_APP_MEASUREMENTID
}) : firebase.apps[0];
const projectStorage = firebase.storage();
const projectFirestore = firebase.firestore();
const timeStamp = firebase.firestore.FieldValue.serverTimestamp;
const provider = new firebase.auth.GoogleAuthProvider();

const useAllPosts = (order) => {
    const [docs, setDocs] = useState([]);
    useEffect(() => {
        const unsub = projectFirestore.collection('posts')
            .orderBy(order.type, order.direct)
            .onSnapshot((snap) => {
                let documents = [];
                snap.forEach(doc => {
                    documents.push({ ...doc.data(), id: doc.id });
                });
                setDocs(documents);
            });
        return () => unsub();
    }, [order.direct, order.type]);
    return { docs };
};

const useAllPostsOnce = (value) => {
    const [docs, setDocs] = useState([]);
    useEffect(() => {
        const unsub = projectFirestore.collection('posts')
            .orderBy('createdAt', 'desc')
            .onSnapshot((snap) => {
                let documents = [];
                snap.forEach(doc => {
                    if (doc.data().createdAt.toDate().getTime() < value) {
                        documents.push({ ...doc.data(), id: doc.id });
                    }
                });
                setDocs(documents);
            });
        return () => unsub();
    }, [value]);
    return { docs };
};

const usePopularPostsOnce = () => {
    const [docs, setDocs] = useState([]);
    useEffect(() => {
        const unsub = projectFirestore.collection('posts')
            .orderBy('likeCount', 'desc')
            .onSnapshot((snap) => {
                let documents = [];
                snap.forEach(snap => {
                    documents.push({ ...snap.data(), id: snap.id });
                });
                setDocs(documents);
            });
        return () => unsub();

    }, []);
    return { docs };
};

const useUserPosts = (collection, order) => {
    const [docs, setDocs] = useState([]);
    useEffect(() => {
        const unsub = projectFirestore.collection('posts')
            .where("user", '==', collection.toString())
            .orderBy(order.type, order.direct)
            .onSnapshot((snap) => {
                let documents = [];
                snap.forEach(snap => {
                    documents.push({ ...snap.data(), id: snap.id });
                });
                setDocs(documents);
            });
        return () => unsub();
    }, [collection, order.direct, order.type]);
    return { docs };
};

const useStroage = (file) => {
    const [err, setErr] = useState(null);
    const [url, setUrl] = useState(null);
    useEffect(() => {
        const storageRef = projectStorage.ref(new Date().getTime().toString());
        storageRef.put(file).on('state_changed', (snap) => {
        }, (err) => {
            setErr(err);
        }, async () => {
            const url = await storageRef.getDownloadURL();
            setUrl(url);
        });
    }, [file]);
    return { url, setUrl, err };
}
const useGetUser = (uid) => {
    const [user, setUser] = useState(null);
    useEffect(() => {
        projectFirestore.collection('users').doc(uid).get().then((doc) => {
            setUser(doc.data());
        });
    }, [uid]);
    return { user };
}
function TrigramIndex(inputPhrases) {
    function asTrigrams(phrase, callback) {
        var rawData = "  ".concat(phrase, "  ");
        for (var i = rawData.length - 3; i >= 0; i = i - 1)
            callback.call(this, rawData.slice(i, i + 3));
    }

    var instance = {
        phrases: [],
        trigramIndex: [],
        phraseIndex: 0,

        index: function (phrase) {
            if (!phrase || phrase === "" || this.phrases.indexOf(phrase) >= 0) return;
            asTrigrams.call(this, phrase, function (trigram) {
                var phrasesForTrigram = this.trigramIndex[trigram];
                this.phraseIndex = this.phrases.push(phrase) - 1;
                if (!phrasesForTrigram) phrasesForTrigram = [];
                if (phrasesForTrigram.indexOf(this.phraseIndex) < 0) phrasesForTrigram.push(this.phraseIndex);
                this.trigramIndex[trigram] = phrasesForTrigram;
            });
        },

        find: function (phrase) {
            var phraseMatches = [];
            asTrigrams.call(this, phrase, function (trigram) {
                var phrasesForTrigram = this.trigramIndex[trigram];
                if (phrasesForTrigram)
                    for (var j in phrasesForTrigram) {
                        this.phraseIndex = phrasesForTrigram[j];
                        if (!phraseMatches[this.phraseIndex]) phraseMatches[this.phraseIndex] = 0;
                        phraseMatches[this.phraseIndex] += 1;
                    }
            });
            var result = [];
            for (var i in phraseMatches)
                result.push({ phrase: this.phrases[i], matches: phraseMatches[i] });

            result.sort(function (a, b) {
                return b.matches - a.matches;// == 0 ? a.phrase.localeCompare(b.phrase) : diff;
            });
            return result;
        }
    };
    for (var i in inputPhrases)
        instance.index(inputPhrases[i]);
    return instance;
}
const useSearchUser = (input) => {
    const [docs, setDocs] = useState([]);
    useEffect(() => {
        projectFirestore.collection('users').get().then((doc) => {
            let documents = [];
            doc.forEach(user => {
                if (TrigramIndex([user.data().username.toLowerCase()]).find(input.toLowerCase()).length > 0) {
                    documents.push({ ...user.data(), id: user.id });
                }
            });
            setDocs(documents);
        });
    }, [input]);
    return { docs };
};

const SigninPopup = (setUser) => {
    firebase.auth()
        .signInWithPopup(provider)
        .then((result) => {
            setUser(result.user);
            const id = result.user.uid;
            const username = result.user.displayName;
            const email = result.user.email;
            const joined = timeStamp();
            const image = result.user.photoURL;
            projectFirestore.collection('users').doc(id).get().then(user => {
                if (!user.exists) {
                    projectFirestore.collection('users').doc(id).set({ username, email, image, joined });
                }
            });
        }).catch((error) => {
            console.log(error);
        });
};
const Logout = (setUser) => {
    firebase.auth().signOut().catch((error) => {
        console.log(error);
    });
    setUser(null);
};

export { base, projectFirestore, timeStamp, provider, SigninPopup, Logout, projectStorage, useAllPosts, useStroage, useUserPosts, useAllPostsOnce, useGetUser, usePopularPostsOnce, useSearchUser }

