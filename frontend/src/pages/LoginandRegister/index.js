import React from 'react';
import useLoginAndRegisterLogic from './LoginandRegister.js';
import * as styles from './LoginandRegister.module.scss';
import classNames from 'classnames/bind';
import '@fortawesome/fontawesome-free/css/all.min.css';

const cx = classNames.bind(styles);

function LoginAndRegister() {
  const { isSignUpActive, toggleToSignUp, toggleToSignIn } = useLoginAndRegisterLogic();

  return (
    <div className={cx('wrapper')}>
      <div className={cx('container', { active: isSignUpActive })} id="container">
        {/* Sign Up Form */}
        <div className={cx('form-container', 'sign-up', { hidden: !isSignUpActive })}>
          <form>
            <h1>Create Account</h1>
            <div className={styles['social-icons']}>
              <a href="#" className="icon">
                <i className="fa-brands fa-google-plus-g"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-github"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-linkedin-in"></i>
              </a>
            </div>
            <span>or use your email for registration</span>
            <input type="text" placeholder="Name" />
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <button>Sign Up</button>
          </form>
        </div>

        {/* Sign In Form */}
        <div className={cx('form-container', 'sign-in', { hidden: isSignUpActive })}>
          <form>
            <h1>Sign In</h1>
            <div className={styles['social-icons']}>
              <a href="#" className="icon">
                <i className="fa-brands fa-google-plus-g"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-github"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-linkedin-in"></i>
              </a>
            </div>
            <span>or use your email password</span>
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <a href="#">Forget Your Password?</a>
            <button>Sign In</button>
          </form>
        </div>

        {/* Toggle Panel */}
        <div className={styles['toggle-container']}>
          <div className={styles.toggle}>
            <div className={cx('toggle-panel', 'toggle-left')}>
              <h1>Welcome Back!</h1>
              <p>Enter your personal details to use all of site features</p>
              <button className={styles.hidden} onClick={toggleToSignIn}>
                Sign In
              </button>
            </div>
            <div className={cx('toggle-panel', 'toggle-right')}>
              <h1>Hello, Friend!</h1>
              <p>Register with your personal details to use all of site features</p>
              <button className={styles.hidden} onClick={toggleToSignUp}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginAndRegister;
