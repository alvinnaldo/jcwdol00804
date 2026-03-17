import React, { useEffect, useState } from "react";
import Page from "../../Components/Page";
import { MdShoppingCartCheckout } from "react-icons/md";
import { FcShop } from "react-icons/fc";
import { TbTrashX } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { API_URL } from "../../helper";
import { getCartList } from "../../Actions/cart";
import { useNavigate } from "react-router-dom";

const MyCart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartList = useSelector((state) => {
    return state.cartReducer;
  });

  const shopName = cartList.map((val) => val.branch_name)[0];

  const outOfStockList = cartList.filter((val) => val.quantity > val.stock);

  const [checkedItem, setCheckedItem] = useState([]);

  const [modalData, setModalData] = useState({});

  const [isModal, setIsModal] = useState(false);

  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    dispatch(getCartList());
    // eslint-disable-next-line
  }, []);
  
  useEffect(() => {
    setCheckedItem(cartList.map((val,idx) => checkedItem[idx]));
    // eslint-disable-next-line
  }, [cartList]);

  useEffect(() => {
    setTotalPrice(cartList.reduce((total, val, idx) => {
      return checkedItem[idx] ? (total + (val.price * val.quantity)) : total
    },0));
  }, [cartList, checkedItem])
  

  const sumSelected = (arr) => {
    let sum = 0;
    for (const idx in arr) {
      if (arr[idx] === true) {
        sum += cartList[idx].price * cartList[idx].quantity;
      }
    }
    return sum;
  };
  
  const handleChecked = (pos) => {
    const updatedCheckedItem = checkedItem.map((val, idx) => {
      return idx === pos ? !val : val;
    });
    setCheckedItem(updatedCheckedItem);
    setTotalPrice(sumSelected(updatedCheckedItem));
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const updatedCheckedItem = checkedItem.map((val, idx) =>
        cartList[idx].quantity > cartList[idx].stock ? false : true
      );
      setCheckedItem(updatedCheckedItem);
      setTotalPrice(sumSelected(updatedCheckedItem));
    } else {
      setCheckedItem(checkedItem.map((val) => false));
      setTotalPrice(0);
    }
  };

  const handleQuantity = async (type, id, product_id) => {
    let token = localStorage.getItem("xmart_login");
    await axios.patch(
      `${API_URL}/cart/update-cart-qty`,
      { type, id, product_id },
      {
        timeout: 1000,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    dispatch(getCartList());
  };

  const handleDelete = async (id) => {
    let token = localStorage.getItem("xmart_login");
    await axios.patch(
      `${API_URL}/cart/delete-item`,
      { id },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    dispatch(getCartList());
  };

  const renderCart = () => {
    return (
      <div className="flex flex-col px-3 mb-20">
        {/* Modal Section */}
        {isModal && (
          <div className="container flex justify-center mx-auto z-10">
            <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50 ">
              <div className="max-w-sm  p-6 bg-white divide-y divide-gray-500">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl">Delete confirmation</h3>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    cursor="pointer"
                    onClick={() => setIsModal(!isModal)}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="mt-4">
                  <p className="text-lg mt-4 font-bold">{modalData.shopName}</p>
                  <p className="mb-4 text-sm mt-2">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-red-500">
                      {modalData.productName}
                    </span>{" "}
                    from your cart?
                  </p>
                  <div className="flex flex-row justify-center">
                    <div
                      className="px-4 py-2 text-sm underline decoration-double cursor-pointer"
                      onClick={() => setIsModal(!isModal)}
                    >
                      Cancel
                    </div>
                    <button
                      className="px-4 py-2 text-white bg-red-500 rounded"
                      onClick={() => {
                        handleDelete(modalData.deleteId);
                        setIsModal(!isModal);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Cart Active List */}
        <div>
          {cartList.length ? (
            <div className="flex flex-row items-center border-b-2 border-[#82CD47]/[.5] mt-3 py-2">
              <FcShop className="ml-2 mr-1" />
              <span className="font-bold">{shopName}</span>
            </div>
          ) : (
            <div className="flex flex-row items-center justify-center h-[70vh] text-red-500">
              Your cart is empty
            </div>
          )}

          {cartList.map((val2, idx2) => {
            if (val2.quantity <= val2.stock) {
              return (
                <div
                  className="flex flex-row items-center border-b-2 py-1 relative"
                  key={idx2}
                >
                  <input
                    type="checkbox"
                    id={`checkbox-${idx2}`}
                    checked={checkedItem[idx2] ?? ""}
                    onChange={() => handleChecked(idx2)}
                  />
                  <img
                    src={`http://localhost:8000/${val2.product_img}`}
                    alt={val2.name}
                    className=" w-24 h-24 ml-2 my-2 border text-xs"
                  />
                  <div className="flex flex-col ml-2">
                    <span className="font-bold w-[210px]">{val2.name}</span>
                    <span className="text-[#6CC51D] font-bold">
                      Rp {val2.price.toLocaleString("id")}
                    </span>
                  </div>
                  <div className="flex flex-col absolute right-0 mr-2 justify-center items-center">
                    <div className="flex flex-row items-center ">
                      <button
                        className="rounded-full w-[22px] h-[22px] bg-[#82CD47] text-2xl text-white flex items-center justify-center"
                        onClick={() =>
                          handleQuantity("decrement", val2.id, val2.product_id)
                        }
                        disabled={val2.quantity === 1}
                      >
                        <span className="mb-[5px]">-</span>
                      </button>
                      <span className="mb-1 ml-2 mr-2">{val2.quantity}</span>
                      <button
                        className="rounded-full w-[22px] h-[22px] bg-[#82CD47] text-2xl text-white flex items-center justify-center mr-2"
                        onClick={() =>
                          handleQuantity("increment", val2.id, val2.product_id)
                        }
                        disabled={val2.quantity === val2.stock}
                      >
                        <span className="mb-[5px]">+</span>
                      </button>
                      <TbTrashX
                        size={20}
                        className="mb-1 cursor-pointer"
                        onClick={() => {
                          setIsModal(!isModal);
                          setModalData({
                            productName: val2.name,
                            deleteId: val2.id,
                            shopName: val2.branch_name,
                          });
                        }}
                      />
                    </div>
                    {val2.quantity === val2.stock && (
                      <div className="text-red-500 animate-pulse">
                        Stock : {val2.stock}
                      </div>
                    )}
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>
        {/* Out of Stock */}
        {outOfStockList.length ? (
          <div className="flex flex-row items-center border-b-2 border-[#82CD47]/[.5] mt-3 py-2">
            <span className="font-bold">Out of Stock</span>
          </div>
        ) : null}
        {outOfStockList &&
          outOfStockList.map((val3, idx3) => {
            return (
              <div key={idx3}>
                <div className="flex flex-row items-center border-b-2 py-1 relative opacity-60">
                  <img
                    src="https://www.freeiconspng.com/thumbs/no-image-icon/no-image-icon-6.png"
                    alt={val3.name}
                    className=" w-24 h-24 ml-2 my-2 border text-xs"
                  />
                  <div className="flex flex-col ml-2">
                    <span className="text-red-500 font-bold">
                      {val3.branch_name}
                    </span>
                    <span className="font-bold w-[210px]">{val3.name}</span>
                    <span className="text-[#6CC51D] font-bold">
                      Rp {val3.price.toLocaleString("id")}
                    </span>
                  </div>
                  <div className="flex flex-row items-center absolute right-0 mr-2">
                    <div className="flex flex-col items-end mr-2 ">
                      <div className="text-red-500">
                        Cart quantity : {val3.quantity}
                      </div>
                      <div>Stock left : {val3.stock}</div>
                    </div>
                    <TbTrashX
                      size={20}
                      className="mb-1 cursor-pointer text-red-500"
                      onClick={() => {
                        setIsModal(!isModal);
                        setModalData({
                          productName: val3.name,
                          deleteId: val3.id,
                          shopName: val3.branch_name,
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    );
  };

  const checkOutBtn = () => {
    if (checkedItem.every((val) => val === false)) {
    } else {
      navigate("/order-confirmation", {
        state: {
          totalPrice,
          shopName,
          items: checkedItem
            .map((val, idx) => (val ? cartList[idx] : false))
            .filter((val) => val !== false),
          totalWeight: checkedItem
            .map((val, idx) =>
              val ? cartList[idx].weight * cartList[idx].quantity : false
            )
            .filter((val) => val !== false)
            .reduce((p, c) => p + c),
          shopCityName: cartList.map((val) => val.branch_cityname)[0],
        },
      });
    }
  };

  return (
    <Page isFooter={false} navTitle="My Cart">
      <div>
        {/* Cart List */}
        {renderCart()}
        {/* Total Price */}
        <div className="bg-[#d8fcbb]/[.8] flex justify-between py-3 px-3 fixed bottom-0 w-[480px]">
          <div>
            <input
              type="checkbox"
              id="select-all"
              className="mr-2"
              onClick={(e) => handleSelectAll(e)}
            />
            <label htmlFor="select-all">Select All</label>
          </div>
          <span>
            <span className="mr-2 font-bold">
              Total Price : Rp {totalPrice.toLocaleString("id")}
            </span>
            <button
              className="bg-[#82cd47] rounded-full px-3 text-white"
              onClick={checkOutBtn}
            >
              Checkout
              <MdShoppingCartCheckout className="inline mb-1 ml-1" size={18} />
            </button>
          </span>
        </div>
      </div>
    </Page>
  );
};

export default MyCart;
