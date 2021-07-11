import React, { useEffect } from 'react';
import { useStroage, projectFirestore, timeStamp } from '../firebaseConfig';
import { useLocation } from "react-router";
export function PostForm({ file, setFile, text, getUser }) {
    const { url, setUrl } = useStroage(file);
    const location = useLocation().pathname;
    const uid = location.split('/')[2];
    const user = uid;
    const image = getUser.photoURL;
    useEffect(() => {
        if (url) {
            const imageFile = document.getElementById('upload-file');
            imageFile.value = '';
            const createdAt = timeStamp();
            projectFirestore.collection('posts').add({ text, url, user, image, createdAt, likes: [] });
            setUrl(null);
            setFile(null);
        }
    }, [url, setUrl, setFile, image, user, text,])
    return (
        <>
        </>
    )
}
