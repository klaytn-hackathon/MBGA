import React from 'react'
import LoginForm from 'components/LoginForm'

const styles = {
  loginPage: {
    position: "flex",
    height: "100%",
  },
};

const LoginPage = () => (
  <main className="LoginPage" style={ styles.loginPage }>
    <LoginForm style={ styles.loginForm }/>
  </main>
);

export default LoginPage;
