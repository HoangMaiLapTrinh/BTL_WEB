import React, { useState } from "react";
import classNames from "classnames/bind";
import * as styles from "./ProductDetail.module.scss";
import { showToast } from "../../components/Toast/index.js";

const cx = classNames.bind(styles);

function Product() {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    // Logic xử lý thêm vào giỏ hàng ở đây
    showToast({
      title: "Thành công",
      message: `Đã thêm sản phẩm vào giỏ hàng!`,
      type: "success",
      duration: 3000
    });
  };

  const handleQuantityChange = (value) => {
    const newQuantity = quantity + value;
    if (newQuantity > 0) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className={cx('product-detail')}>
      <h1>Chi tiết sản phẩm</h1>
      <div className={cx('product-actions')}>
        <div className={cx('quantity-selector')}>
          <button onClick={() => handleQuantityChange(-1)}>-</button>
          <span>{quantity}</span>
          <button onClick={() => handleQuantityChange(1)}>+</button>
        </div>
        <button 
          className={cx('add-to-cart')}
          onClick={handleAddToCart}
        >
          Thêm vào giỏ hàng
        </button>
      </div>
    </div>
  );
}

export default Product;