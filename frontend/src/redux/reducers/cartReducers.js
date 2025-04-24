import {
  CHECKOUT_REQUEST,
  CHECKOUT_SUCCESS,
  CHECKOUT_FAIL,
  CHECKOUT_RESET,
  CART_ADD_ITEM,
  CART_REMOVE_ITEM,
  CART_UPDATE_ITEM,
  CART_CLEAR,
  CART_RESET,
  PAYMENT_REQUEST,
  PAYMENT_SUCCESS,
  PAYMENT_FAIL,
  PAYMENT_RESET,
} from '../actions/cartActions.js';

export const checkoutReducer = (state = {}, action) => {
  switch (action.type) {
    case CHECKOUT_REQUEST:
      return { loading: true };
    case CHECKOUT_SUCCESS:
      return { loading: false, success: true, order: action.payload };
    case CHECKOUT_FAIL:
      return { loading: false, error: action.payload };
    case CHECKOUT_RESET:
      return {};
    default:
      return state;
  }
};

export const cartReducer = (state = { cartItems: [] }, action) => {
  switch (action.type) {
    case CART_ADD_ITEM:
      const newItem = action.payload;
      const existingItem = state.cartItems.find(
        (item) => item.productId === newItem.productId
      );

      if (existingItem) {
        return {
          ...state,
          cartItems: state.cartItems.map((item) =>
            item.productId === existingItem.productId ? newItem : item
          ),
        };
      } else {
        return {
          ...state,
          cartItems: [...state.cartItems, newItem],
        };
      }

    case CART_UPDATE_ITEM:
      return {
        ...state,
        cartItems: state.cartItems.map((item) =>
          item.productId === action.payload.productId ? action.payload : item
        ),
      };

    case CART_REMOVE_ITEM:
      return {
        ...state,
        cartItems: state.cartItems.filter(
          (item) => item.productId !== action.payload
        ),
      };

    case CART_CLEAR:
    case CART_RESET:
      return {
        ...state,
        cartItems: [],
      };

    default:
      return state;
  }
};

export const paymentReducer = (state = {}, action) => {
  switch (action.type) {
    case PAYMENT_REQUEST:
      return { loading: true };
    case PAYMENT_SUCCESS:
      return { loading: false, success: true, paymentResult: action.payload };
    case PAYMENT_FAIL:
      return { loading: false, error: action.payload };
    case PAYMENT_RESET:
      return {};
    default:
      return state;
  }
}; 