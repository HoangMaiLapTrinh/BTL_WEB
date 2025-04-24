import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import * as styles from './ProductItem.module.scss';

const cx = classNames.bind(styles);

function ProductItem({ product }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className={cx('product-item')}>
      <Link to={`/products/${product._id}`} className={cx('product-link')}>
        <div className={cx('product-image')}>
          {product.images && product.images.length > 0 ? (
            <img src={product.images[0].url} alt={product.name} />
          ) : (
            <img src="https://via.placeholder.com/300x400" alt="Placeholder" />
          )}
        </div>
        <div className={cx('product-info')}>
          <h3 className={cx('product-name')}>{product.name}</h3>
          <p className={cx('product-price')}>{formatPrice(product.price)}</p>
        </div>
      </Link>
    </div>
  );
}

export default ProductItem; 