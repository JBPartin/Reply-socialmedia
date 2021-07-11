import '../styles/App.css';
import Nav from './Nav';
import MyBlogs from './MyBlogs';
import Home from './Home';
import Explore from './Explore'
import { useState, useEffect } from 'react';
import { base } from '../firebaseConfig';
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import Messages from './Messages';
function App() {
  const [getUser, setUser] = useState(null);
  useEffect(() => {
    base.auth().onAuthStateChanged(function (user) {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    }, err => console.log(err));
  }, [getUser]);
  return (
    <Router>
      <Nav getUser={getUser} setUser={setUser} />
      <Switch>
        <Route
          exact
          path="/"
          render={() => {
            return (<Redirect to="/home" />)
          }}
        />
        <Route path='/home'>
          <Home getUser={getUser} setUser={setUser} />
        </Route>
        <Route path='/explore'>
          <Explore getUser={getUser} setUser={setUser} />
        </Route>
        <Route path='/messages'>
        <Messages getUser={getUser} setUser={setUser} />
        </Route>
        <Route path='/notification'>
          <Messages getUser={getUser} setUser={setUser} />
        </Route>
        <Route path='/user/:id'>
          <MyBlogs getUser={getUser} setUser={setUser} />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
