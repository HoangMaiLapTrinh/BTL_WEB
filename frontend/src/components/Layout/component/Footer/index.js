import React from 'react';
import * as styles from './Footer.module.scss';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Link, useLocation } from 'react-router-dom';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const Footer = () => {
  const location = useLocation();
  const hideFooterPaths = ['/info', '/login'];
  
  if (hideFooterPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <section className={cx('new_footer_area')}>
      <div className={cx('hide-for-small')}>
        <div className={cx('grid')}>
        </div>
        <div>
          <div className={cx('new_footer_top')}>
            <div className={cx('container')}>
              <div className={cx('row')}>
                <div className={cx('col-new', 'l-3')}>
                  <div className={cx('f_widget', 'company_widget')}>
                    <h3 className={cx('f-title', 'f_600', 'f_size_18')}>Contact Us</h3>
                    <p>Đừng bỏ lỡ bất kỳ cập nhật nào về các mẫu và sản phẩm mới của chúng tôi !</p>
                    <form action="#" className={cx('f_subscribe_two')} method="post">
                      <input type="text" name="EMAIL" className={cx('form-control')} placeholder="Email" />
                      <button className={cx('btn_get')} type="submit">SUBSCRIBE</button>
                    </form>
                  </div>
                </div>
                <div className={cx('col-new', 'l-3')}>
                  <div className={cx('f_widget', 'about-widget')}>
                    <h3 className={cx('f-title', 'f_600', 'f_size_18')}>Member</h3>
                    <ul className={cx('f_list')}>
                      <li><Link to="#">Phan Anh Tuấn</Link></li>
                      <li><Link to="#">Nguyễn Đức Vương</Link></li>
                      <li><Link to="#">Mai Lê Huy Hoàng</Link></li>
                    </ul>
                  </div>
                </div>
                <div className={cx('col-new', 'l-3')}>
                  <div className={cx('f_widget', 'about-widget')}>
                    <h3 className={cx('f-title', 'f_600', 'f_size_18')}>Help</h3>
                    <ul className={cx('f_list')}>
                      <li><Link to="#">FAQ</Link></li>
                      <li><Link to="#">Term & conditions</Link></li>
                      <li><Link to="#">Reporting</Link></li>
                      <li><Link to="#">Documentation</Link></li>
                      <li><Link to="#">Support Policy</Link></li>
                      <li><Link to="#">Privacy</Link></li>
                    </ul>
                  </div>
                </div>
                <div className={cx('col-new', 'l-3')}>
                  <div className={cx('f_widget', 'social-widget')}>
                    <h3 className={cx('f-title', 'f_600', 'f_size_18')}>Contact Us Via</h3>
                    <div className={cx('f_social_icon')}>
                      <Link to="#"><i className="fab fa-facebook"></i></Link>
                      <Link to="#"><i className="fab fa-github"></i></Link>
                      <Link to="#"><i className="fab fa-youtube"></i></Link>
                      <Link to="#"><i className="fab fa-instagram"></i></Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={cx('footer_bg')}>
              <div className={cx('footer_bg_one')}></div>
              <div className={cx('footer_bg_two')}></div>
            </div>
          </div>
        </div>
        <div className={cx('footer_bottom')}>
          <div className={cx('container')}>
            <div className={cx('row')}>
              <div className="col-lg-6 col-sm-7">
                <p>© Nhóm 3</p>
              </div>
              <div className="col-lg-6 col-sm-5">
                <p>Made by <Link to="#">SHOP Đồng Hồ</Link></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Footer;
