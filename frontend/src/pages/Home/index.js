import React from 'react';
import { Link } from 'react-router-dom';
import * as styles from './Home.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const Home = () => {
  return (
    <div className={cx('home-container')}>
      <h1>Welcome to Home Page</h1>
    </div>
  );
};

export default Home;