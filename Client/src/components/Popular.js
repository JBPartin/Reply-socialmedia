import { motion } from "framer-motion";
import React from "react";
import firebase from "firebase";
import { usePopularPostsOnce, projectFirestore } from "../firebaseConfig";
import { useHistory } from "react-router-dom";
export default function Popular({ getUser }) {
    const history = useHistory();
    const { docs } = usePopularPostsOnce();
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
    const likeBlog = (id) => {
        projectFirestore.collection('posts').doc(id).update({
            likes: firebase.firestore.FieldValue.arrayUnion(getUser.uid),
            likeCount: firebase.firestore.FieldValue.increment(1)
        });
    }
    const unlikeBlog = (id) => {
        projectFirestore.collection('posts').doc(id).update({
            likes: firebase.firestore.FieldValue.arrayRemove(getUser.uid),
            likeCount: firebase.firestore.FieldValue.increment(-1)
        });
    }
    return (
        <div className='popular'>
            <h1><i class="fa fa-hashtag" aria-hidden="true"></i> Trending</h1>
            <div className='profile-posts scrollbar'>
                {docs && docs.map(doc => (
                    <motion.div className='blog-container' key={doc.id}
                        initial="hidden"
                        animate="visible"
                        variants={{
                            visible: { opacity: 1 },
                            hidden: { opacity: 0 },
                        }}
                        layout>
                        <div className='blog-text-container'>
                            <img className='blog-pfimage' src={doc.image} alt='Profile Post' onClick={() => { history.push(`/user/${doc.user}`)}}/>
                            <div className='container-flex-column'>
                                {doc.createdAt && <p className='blog-time'>{timeDiffCalc(new Date(doc.createdAt.toDate()))}</p>}
                                <p className='blog-doc-text'>{doc.text}</p>
                                {doc.url && <img className='post-image' src={doc.url} alt='Added in post' />}
                            </div>
                        </div>
                        {getUser && <div className='blog-like'>
                            {doc.user !== `${getUser.uid}` && doc.user !== `${getUser.uid}` && ((doc.likes && doc.likes.includes(`${getUser.uid}`)) ? <i style={{ color: '#fd0f37' }} className="fa fa-heart" aria-hidden="true" onClick={() => { unlikeBlog(doc.id); }} /> : <i className="fa fa-heart-o" aria-hidden="true" onClick={() => { likeBlog(doc.id); }} />)}
                        </div>}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}