import React, { useState, useEffect } from "react";
import { useUserPosts, projectFirestore } from "../firebaseConfig";
import firebase from 'firebase/app';
import { useLocation } from "react-router";
export default function Account({ getUser }) {
    const [value, setValue] = useState();
    const [pageUser, setPageUser] = useState(null);
    const location = useLocation().pathname.trim();
    const uid = location.split('/')[2].trim();
    const follow = () => {
        projectFirestore.collection('users').doc(uid).update({
            followers: firebase.firestore.FieldValue.arrayUnion(getUser.uid)
        }).then(update => {
            projectFirestore.collection('users').doc(getUser.uid).update({
                following: firebase.firestore.FieldValue.arrayUnion(uid)
            });
            setValue(new Date().getTime());
        });
    }
    const unfollow = () => {
        projectFirestore.collection('users').doc(uid).update({
            followers: firebase.firestore.FieldValue.arrayRemove(getUser.uid)
        }).then(update => {
            projectFirestore.collection('users').doc(getUser.uid).update({
                following: firebase.firestore.FieldValue.arrayRemove(uid)
            });
            setValue(new Date().getTime());
        });
    }
    useEffect(() => {
        projectFirestore.collection('users').doc(uid).get().then((user) => {
            if (user && user.exists) {
                setPageUser({ ...user.data() });
            } else {
                setPageUser(null);
            }
        });
    }, [uid, value]);
    const { docs } = useUserPosts(uid, { type: 'createdAt', direct: 'desc' });
    if (!pageUser)
        return (<></>)
    else
        return (
            <div className='account-bar'>
                <div className='profile-info'>
                    <img className='profile-img' src={pageUser.image} alt='Users Profile' width='80px' />
                    <h2>{pageUser.username}</h2>
                    <h3><i className="fa fa-calendar" aria-hidden="true"></i>{' '}Joined {pageUser && pageUser.joined.toDate().toLocaleDateString()}</h3>
                    <div className='follow-counts'>
                        <h3>{pageUser.followers ? pageUser.followers.length : '0'} Followers</h3>
                        <h3>{pageUser.following ? pageUser.following.length : '0'} Following</h3>
                    </div>
                    <h3>{docs ? docs.length.toLocaleString() : ''} Posts</h3>
                    <div>
                        {uid !== `${getUser.uid}` && ((pageUser.followers && pageUser.followers.includes(`${getUser.uid}`)) ? <button className='unfollow-btn acct-btn btn' onClick={unfollow}>Unfollow</button> : <button className='follow-btn acct-btn btn' onClick={follow}>Follow</button>)}
                    </div>
                </div>
            </div>
        );
}