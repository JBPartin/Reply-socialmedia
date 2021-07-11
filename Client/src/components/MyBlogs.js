import React, { useState, useEffect } from "react";
import firebase from 'firebase/app';
import { useLocation } from "react-router";
import { projectFirestore, useUserPosts, timeStamp, projectStorage } from "../firebaseConfig";
import { motion } from 'framer-motion'
import { PostForm } from "./PostForm";
import Tabs from "./Tabs";
import Account from "./Account";
export default function MyBlogs({ getUser, setUser }) {
    const location = useLocation().pathname.trim();
    const uid = location.split('/')[2].trim();
    const [getFile, setFile] = useState(null);
    const [pageUser, setPageUser] = useState(null);
    const [imageSrc, setImageSrc] = useState(null);
    const [uImageSrc, setUImageSrc] = useState(null);
    const [text, setBlogText] = useState(null);
    const { docs } = useUserPosts(uid, { type: 'createdAt', direct: 'desc' });
    const Blog = () => {
        const blogText = document.getElementById('blog-text');
        const imageFile = document.getElementById('upload-file');
        const file = imageFile.files[0];
        if ((!blogText.value || blogText.value === '') && !file)
            return
        const createdAt = timeStamp();
        setBlogText(blogText.value);
        const user = uid;
        const image = getUser.photoURL;
        if (file && ['image/png', 'image/jpeg'].includes(file.type)) {
            setFile(file);
            setImageSrc(null);
        } else {
            setFile(null);
            projectFirestore.collection('posts').add({ text: blogText.value, createdAt, user, image, likes: [], likeCount: 0 });
        }
        blogText.value = '';
    }
    const editBlog = () => {
        const editor = document.getElementById('dropdown-menu-editor');
        editor.classList.toggle('dropdown-hidden');
        const blogText = document.getElementById('edit-blog-text');
        const imageFile = document.getElementById('edit-file');
        const file = imageFile.files[0];
        if ((!blogText.value || blogText.value === '') && !file)
            return
        if (file && ['image/png', 'image/jpeg'].includes(file.type)) {
            const storageRef = projectStorage.ref(new Date().getTime().toString());
            storageRef.put(file).on('state_changed', (snap) => {
            }, (err) => {
                console.log(err);
            }, async () => {
                const url = await storageRef.getDownloadURL();
                projectFirestore.collection('posts').doc(imageFile.name).update({ text: blogText.value, url });
                blogText.value = '';
            });
            setImageSrc(null);
        } else {
            setFile(null);
            projectFirestore.collection('posts').doc(imageFile.name).update({ text: blogText.value, url: null });
            blogText.value = '';
        }
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
    const deleteBlog = (id) => {
        projectFirestore.collection('posts').doc(id).delete().then(() => console.log('deleted')).catch(err => console.log(err));
    }
    const updateBlog = (id) => {
        projectFirestore.collection('posts').doc(id).get().then((doc) => {
            let data = { ...doc.data() };
            const imageFile = document.getElementById('edit-file');
            imageFile.name = id;
            if (data.url)
                setUImageSrc(data.url);
            const text = document.getElementById('edit-blog-text');
            text.value = data.text;
            const drop = document.getElementById('dropdown-menu-editor');
            drop.classList.toggle('dropdown-hidden');
        });
    }

    useEffect(() => {
        projectFirestore.collection('users').doc(uid).get().then((user) => {
            if (user && user.exists) {
                setPageUser({ ...user.data(), uid: uid });
            } else {
                setPageUser(null);
            }
        });
    }, [uid]);

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
    function changeFile(e) {
        if (e.target.files[0])
            setImageSrc(URL.createObjectURL(e.target.files[0]));
        else
            setImageSrc(null);
    }
    function changeUFile(e) {
        if (e.target.files[0])
            setUImageSrc(URL.createObjectURL(e.target.files[0]));
        else {
            setUImageSrc(null);
        }
    }
    function removeImage() {
        if (imageSrc) {
            const imageFile = document.getElementById('upload-file');
            imageFile.value = '';
            setImageSrc(null);
        }
        if (uImageSrc) {
            document.getElementById('edit-file').value = '';
            setUImageSrc(null);
        }
    }
    if (!pageUser && !getUser)
        return (<></>)
    else
        return (
            <>
                <div id='dropdown-menu-editor' className='dropdown-hidden'>
                    <div id='editor'>
                        <div className='post-form'>
                            <textarea id='edit-blog-text' placeholder='Edit post!' maxLength="120" />
                            {uImageSrc &&
                                <>
                                    <img className='image-to-post' src={uImageSrc} alt='To be posted' />
                                    <button className='remove-image btn' onClick={removeImage}>X</button>
                                </>}
                            <div className='post-form-additions'>
                                <div className='fileUpload'>
                                    <span><i className="fa fa-picture-o" aria-hidden="true"></i></span>
                                    <input type='file' name='' className="upload" id='edit-file' onChange={changeUFile} />
                                </div>
                                <button className='btn' type='submit' onClick={editBlog}>Edit</button>
                            </div>
                            {getFile && <PostForm file={getFile} setFile={setFile} text={text} getUser={getUser} />}
                        </div>
                    </div>
                </div>
                <div className='profile-page'>
                    <Tabs user={getUser} setUser={setUser} />
                    <div className='middle'>
                        {getUser && location === `/user/${getUser.uid}` &&
                            <div className='post-form'>
                                <textarea id='blog-text' placeholder='Make a post!' maxLength="120" />
                                {imageSrc &&
                                    <>
                                        <img className='image-to-post' src={imageSrc} alt='To be posted' />
                                        <button className='remove-image btn' onClick={removeImage}>X</button>
                                    </>}
                                <div className='post-form-additions'>
                                    <div className='fileUpload'>
                                        <span><i className="fa fa-picture-o" aria-hidden="true"></i></span>
                                        <input type='file' name='' className="upload" id='upload-file' onChange={changeFile} />
                                    </div>
                                    <button className='btn' type='submit' onClick={Blog}>Post</button>
                                </div>
                                {getFile && <PostForm file={getFile} setFile={setFile} text={text} getUser={getUser} />}
                            </div>
                        }
                        {location !== `/user/${getUser.uid}` && <h1 className='middle-h1'><i class="fa fa-user" aria-hidden="true"></i> Profile Posts</h1>}
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
                                        {pageUser && <img className='blog-pfimage' src={pageUser.image} alt='Profile Post' />}
                                        <div className='container-flex-column'>
                                            {doc.createdAt && <p className='blog-time'>{timeDiffCalc(new Date(doc.createdAt.toDate()))}</p>}
                                            <p className='blog-doc-text'>{doc.text}</p>
                                            {doc.url && <img className='post-image' src={doc.url} alt='Added in post' />}
                                        </div>
                                    </div>
                                    {getUser && <div className='blog-like'>
                                        {location !== `/user/${getUser.uid}` && doc.user !== `${getUser.uid}` && ((doc.likes && doc.likes.includes(`${getUser.uid}`)) ? <i style={{ color: '#fd0f37' }} className="fa fa-heart" aria-hidden="true" onClick={() => { unlikeBlog(doc.id); }} /> : <i className="fa fa-heart-o" aria-hidden="true" onClick={() => { likeBlog(doc.id); }} />)}
                                        {location === `/user/${getUser.uid}` &&
                                            <div className='blog-ud'>
                                                <i className="fa fa-pencil" aria-hidden="true" onClick={() => { updateBlog(doc.id); }} />
                                                <i className="fa fa-trash" aria-hidden="true" onClick={() => { deleteBlog(doc.id); }} />
                                            </div>}
                                    </div>}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                    <Account getUser={getUser} />
                </div>
            </>
        );
}