
import React, { useState, useEffect } from "react";
import { useAllPostsOnce, projectFirestore } from "../firebaseConfig";
import firebase from 'firebase/app';
import { motion } from "framer-motion";
import Tabs from "./Tabs";
import { useHistory } from "react-router-dom";
import Popular from "./Popular";
let date = new Date().getTime();
export default function Home({ getUser, setUser }) {
    const history = useHistory();
    const [user, setThisUser] = useState(null);
    const [value, setValue] = useState(date);
    let { docs } = useAllPostsOnce(value);
    function timeDiffCalc(dateFuture, dateNow = new Date()) {
        let diffInMilliSeconds = Math.abs(dateFuture - dateNow) / 1000;
        const days = Math.floor(diffInMilliSeconds / 86400);
        diffInMilliSeconds -= days * 86400;

        const hours = Math.floor(diffInMilliSeconds / 3600) % 24;
        diffInMilliSeconds -= hours * 3600;

        const minutes = Math.floor(diffInMilliSeconds / 60) % 60;
        diffInMilliSeconds -= minutes * 60;

        let difference = '';
        if (days > 0) {
            difference += dateFuture.toLocaleDateString();
        } else {
            if (hours > 0)
                difference += hours > 1 ? `${hours}hrs` : `${hours}hr`;
            else
                difference += (minutes === 0 || hours === 1) ? `${minutes}m` : `${minutes}m`;
        }
        return difference;
    }
    useEffect(() => {
        if (getUser)
            projectFirestore.collection('users').doc(getUser.uid).get().then((user) => {
                if (user && user.exists) {
                    setThisUser({ ...user.data() });
                } else {
                    setThisUser(null);
                }
            });
        else
            setThisUser(null);
    }, [getUser, value]);
    const likeBlog = (id) => {
        projectFirestore.collection('posts').doc(id).update({
            likes: firebase.firestore.FieldValue.arrayUnion(getUser.uid),
            likeCount: firebase.firestore.FieldValue.increment(1)
        }).then(update => {
            setValue(date);
        });
    }
    const unlikeBlog = (id) => {
        projectFirestore.collection('posts').doc(id).update({
            likes: firebase.firestore.FieldValue.arrayRemove(getUser.uid),
            likeCount: firebase.firestore.FieldValue.increment(-1)
        }).then(update => {
            setValue(date);
        });
    }
    if (!user)
        return (<>
            <div className='profile-page'>
                <Tabs user={getUser} setUser={setUser} />
                <div className='middle'>
                    <h1>Please sign in to view following</h1>
                </div>
                <Popular getUser={getUser} />
            </div>
        </>)
    else
        return (
            <>
                <div className='profile-page'>
                    <Tabs user={getUser} setUser={setUser} />
                    <div className='middle'>
                        <h1 className='middle-h1'><i class="fa fa-users" aria-hidden="true"></i> Following</h1>
                        <div className='profile-posts scrollbar'>
                            {docs && docs.map(doc => (
                                user && user.following && user.following.includes(doc.user) &&
                                <motion.div className='blog-container' key={doc.id}
                                    initial="hidden"
                                    animate="visible"
                                    variants={{
                                        visible: { opacity: 1 },
                                        hidden: { opacity: 0 },
                                    }}
                                    layout>
                                    <div className='blog-text-container'>
                                        {doc.image && <img style={{ cursor: 'pointer' }} className='blog-pfimage' src={doc.image} alt='Profile Post' onClick={() => { history.push(`/user/${doc.user}`) }} />}
                                        <div className='container-flex-column'>
                                            {doc.createdAt && <p className='blog-time'>{timeDiffCalc(new Date(doc.createdAt.toDate()))}</p>}
                                            <p className='blog-doc-text'>{doc.text}</p>
                                            {doc.url && <img alt='Added to Post' src={doc.url} />}
                                        </div>
                                    </div>
                                    {getUser && <div className='blog-like'>
                                        {doc.user !== `${getUser.uid}` && ((doc.likes && doc.likes.includes(`${getUser.uid}`)) ? <i style={{ color: '#fd0f37' }} className="fa fa-heart" aria-hidden="true" onClick={() => { unlikeBlog(doc.id); }} /> : <i className="fa fa-heart-o" aria-hidden="true" onClick={() => { likeBlog(doc.id); }} />)}
                                    </div>}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                    <Popular getUser={getUser} />
                </div>
            </>
        );
}