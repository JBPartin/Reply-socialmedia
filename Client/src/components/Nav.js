import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { useSearchUser } from "../firebaseConfig";
export default function Nav({ getUser, setUser }) {
    const [value, setValue] = useState('');
    const { docs } = useSearchUser(value)
    const history = useHistory();
    const searchUpdate = (e) => {
        setValue(e.target.value);
    }
    return (
        <nav>
            <ul className='nav-links'>
                <h1 className='logo'><i className="fa fa-reply" aria-hidden="true"></i> Reply</h1>
                <input className='searchbar' onChange={searchUpdate} type='text' placeholder='search...' maxLength="20" />
                {docs.length > 0 &&
                    <ul id='search-menu'>
                        {docs && docs.map(doc => (
                            <li className='search-li'onClick={(e) => { history.push(`/user/${doc.id}`); setValue(''); }}>
                                <img alt='search profile' src={doc.image} />
                                {doc.username}
                            </li>))}
                    </ul>}
            </ul>
        </nav >
    );
}