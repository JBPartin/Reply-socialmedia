import React from "react";
import Tabs from "./Tabs";
import { useLocation } from "react-router";
import Popular from "./Popular";
export default function Messages({ getUser, setUser }) {
    const path = useLocation().pathname.split('/')[1];
    return (
        <>
            <div className='profile-page'>
                <Tabs user={getUser} setUser={setUser} />
                <div className='middle'>
                    <h1 style={{ textAlign: 'center' }}>Coming Soon</h1>
                    <h5 style={{ textAlign: 'center' }}>{path === 'messages' ? 'Message' : path === 'home' ? 'Following' : 'Notification'} Section</h5>
                </div>
                <Popular  getUser={getUser} />
            </div>
        </>
    );
}