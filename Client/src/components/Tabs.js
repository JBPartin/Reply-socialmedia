import React from 'react';
import { useHistory } from 'react-router-dom'
import { SigninPopup, Logout } from "../firebaseConfig";
window.addEventListener('resize', () => {
    const drop = document.getElementById('dropdown-menu');
    const dropEditor = document.getElementById('dropdown-menu-editor');
    if (drop && !drop.classList.contains('dropdown-hidden')) {
        drop.classList.add('dropdown-hidden');
    }
    if (dropEditor && !dropEditor.classList.contains('dropdown-hidden')) {
        dropEditor.classList.add('dropdown-hidden');
    }
});
window.addEventListener('click', (e) => {
    const drop = document.getElementById('dropdown-menu');
    const li = document.getElementById('account-drop');
    const dropEditor = document.getElementById('dropdown-menu-editor');
    const editor = document.getElementById('editor');
    if ((drop && li) && !(Array.from(li.children).includes(e.target) || e.target === li) && !drop.classList.contains('dropdown-hidden')) {
        drop.classList.add('dropdown-hidden');
    }
    if ((dropEditor && editor) && (!dropEditor.classList.contains('dropdown-hidden') && e.target === dropEditor)) {
        dropEditor.classList.add('dropdown-hidden');
    }
});
export default function Tabs({ user, setUser }) {
    const history = useHistory();
    function dropdown() {
        const drop = document.getElementById('dropdown-menu');
        const li = document.getElementById('account-drop');
        if (drop) {
            drop.classList.toggle('dropdown-hidden');
            if (!drop.classList.contains('dropdown-hidden')) {
                drop.style.top = `${li.getBoundingClientRect().y - drop.getBoundingClientRect().height - 5}px`;
            }
        }
    }
    return (
        <div className='tabs-container'>
            <ul>
                <li className='account-li' onClick={() => { history.push('/home') }}><i className="fa fa-home" aria-hidden="true"></i>Home</li>
                <li className='account-li' onClick={() => { history.push('/explore') }}><i className="fa fa-random" aria-hidden="true"></i>Explore</li>
                <li className='account-li' onClick={() => { history.push('/messages') }}><i className="fa fa-envelope" aria-hidden="true"></i>Message</li>
                <li className='account-li' onClick={() => { history.push('/notification') }}><i className="fa fa-bell" aria-hidden="true"></i>Notification</li>
                <li className='account-li' onClick={() => { history.push(user ? `/user/${user.uid} ` : '/home'); }}><i className="fa fa-user" aria-hidden="true"></i>Profile</li>
                <li id='account-drop' className='account-info' onClick={dropdown}>{
                    user ?
                        <><img style={{ borderRadius: '50%', cursor: "pointer" }} src={user.photoURL} alt='Users Profile' width='40px' />
                            <h5>{user.displayName}</h5>
                            <ul id='dropdown-menu' className='dropdown-hidden'>
                                <img src={user.photoURL} alt='Users Profile' />
                                <h1>{user.displayName}</h1>
                                <h3>{user.email}</h3>
                                <li key='logout' onClick={() => { Logout(setUser); history.push('/home') }}>Log Out</li>
                            </ul> </>
                        :
                        <button className='btn' onClick={() => { SigninPopup(setUser); }}>Sign In</button>
                }</li>
            </ul>
        </div>
    )
}
