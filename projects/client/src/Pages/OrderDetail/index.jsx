import React, { useEffect, useState } from "react";
import Page from "../../Components/Page";
import BackButton from "../../Components/BackButton";
import { FcShop } from "react-icons/fc";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../helper";
import { format } from "date-fns";
import toast, { Toaster } from "react-hot-toast";

const OrderDetail = () => {
  const [orderDetail, setOrderDetail] = useState({});
  const [productInfo, setProductInfo] = useState([]);
  const [modalOrderCancel, setModalOrderCancel] = useState(false);
  const [modalOrderComplete, setModalOrderComplete] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();
  const getTotalPrice = (arr) => {
    return arr.map((val) => val.price * val.quantity).reduce((p, c) => p + c);
  };

  const handleCancel = async () => {
    try {
      const result = await axios.patch(`${API_URL}/order/cancel-order/${id}`);
      toast.success(result.data.message);
      getOrderDetail();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const handleComplete = async () => {
    try {
      const result = await axios.patch(
        `${API_URL}/transaction/complete-order/${id}`
      );
      toast.success(result.data.message);
      getOrderDetail();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const getOrderDetail = async () => {
    const token = localStorage.getItem("xmart_login");
    let promise1 = axios.get(`${API_URL}/order/get-order-detail/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    let promise2 = axios.get(`${API_URL}/order/get-product-info/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    Promise.all([promise1, promise2])
      .then((res) => {
        setOrderDetail(res[0].data[0]);
        setProductInfo(res[1].data);
      })
      .catch((err) => console.log(err));
  };
  useEffect(() => {
    getOrderDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <Page isFooter={false} isNavbar={false}>
      <div className="relative">
        <BackButton />
        <Toaster />
        <div className="text-center text-xl py-5 font-bold z-10 relative">
          Order Detail
        </div>
      </div>
      <div className="flex flex-col justify-center items-start">
        <div className="flex flex-col px-5 mt-2">
          {/* Status */}
          <div className="container rounded-xl shadow-md border h-min-[200px] w-[440px] py-3 mb-8">
            <div className="font-bold px-5 text-lg">
              {orderDetail.status && orderDetail.status}
            </div>
            <div className="h-[1px] bg-slate-200 w-[95%] mt-2 ml-3"></div>
            <div className="text-sm font-bold text-slate-400 px-5 mt-2">
              {orderDetail.invoice_no && orderDetail.invoice_no}
            </div>
            <div className="text-sm font-bold text-slate-400 px-5 mt-1">
              Purchased Date :{" "}
              {orderDetail.created_at &&
                format(
                  new Date(orderDetail.created_at),
                  "d MMM yyyy, HH:mm (O)"
                )}
            </div>
          </div>
          {/* Product Detail & Delivery Info */}
          <div className="container rounded-xl shadow-md border h-min-[200px] w-[440px] py-3 mb-8">
            <div className="flex flex-row justify-between items-center ">
              <div className="font-bold px-5">Product Details</div>
              <span className="px-5 font-bold text-slate-400">
                <FcShop className="mb-1 mr-1 inline" />
                {productInfo.length && productInfo[0].branch_name}
              </span>
            </div>
            <div className="h-[1px] bg-slate-200 w-[95%] mt-1 ml-3"></div>
            {productInfo.length &&
              productInfo.map((val, idx) => {
                return (
                  <div key={idx} className="flex flex-row items-center justify-between px-5">
                    <div className="flex flex-row items-center mt-1 ">
                      <img
                        src={`http://localhost:8000/${val.product_img}`}
                        alt={val.name}
                        className=" w-12 h-12 mt-2 border text-xs"
                      />
                      <div className="flex flex-col ml-2">
                        <span className="font-bold text-sm w-[210px] mt-3">
                          {val.name}
                        </span>
                        <span className="text-[#6CC51D] font-bold text-sm">
                          {val.quantity} x Rp {val.price.toLocaleString("id")}
                        </span>
                      </div>
                    </div>
                    <div className="font-bold text-[#6CC51D]">
                      Rp {(val.quantity * val.price).toLocaleString("id")}
                    </div>
                  </div>
                );
              })}
            <div className="h-[6px] bg-slate-200 w-[100%] mt-3 mb-2 "></div>
            <div className="flex flex-col">
              <div className="font-bold px-5">Delivery Info</div>
              <div className="h-[1px] bg-slate-200 w-[95%] mt-1 ml-3"></div>
              <div className="flex flex-row justify-between px-5 mt-1">
                <span>Courier</span>
                <span className="w-[70%]">
                  {orderDetail.courier && orderDetail.courier}
                </span>
              </div>
              <div className="flex flex-row justify-between px-5 mt-1">
                <span>Address</span>
                <div className="w-[70%]">
                  <div>{orderDetail.address && orderDetail.address}</div>
                  <div>
                    {orderDetail.city && orderDetail.city},{" "}
                    {orderDetail.province && orderDetail.province}
                  </div>
                  <div>{orderDetail.zipcode && orderDetail.zipcode}</div>
                </div>
              </div>
            </div>
          </div>
          {/* Shopping Summary */}
          <div className="container rounded-xl shadow-md border h-min-[200px] w-[440px] py-3 mb-12 ">
            <div className="flex flex-col">
              <div className="px-5 font-bold">
                {orderDetail.status &&
                orderDetail.status === "Menunggu Pembayaran"
                  ? "Shopping Summary"
                  : "Payment Detail"}
              </div>
              <div className="h-[1px] bg-slate-200 w-[95%] mt-1 ml-3"></div>
              <div className="flex flex-row justify-between px-5 mt-2">
                <span>Total Price</span>
                <span>
                  Rp{" "}
                  {productInfo.length &&
                    getTotalPrice(productInfo).toLocaleString("id")}
                </span>
              </div>
              <div className="flex flex-row justify-between px-5 mt-2">
                <span>Total Delivery Cost</span>
                <span>
                  Rp{" "}
                  {orderDetail.shipping_cost &&
                    orderDetail.shipping_cost.toLocaleString("id")}
                </span>
              </div>
              <div className="flex flex-row justify-between px-5 mt-2">
                <span>Discount Delivery Cost</span>
                <span>-Rp 0</span>
              </div>
              <div className="flex flex-row justify-between px-5 mt-2">
                <span>Voucher Applied</span>
                <span>-Rp 0</span>
              </div>
              <div className="h-[1px] bg-slate-200 w-[95%] mt-2 ml-3"></div>
            </div>
            <div className="flex flex-row justify-between px-5 mt-2">
              <span className="font-bold">
                {" "}
                {orderDetail.status &&
                orderDetail.status === "Menunggu Pembayaran"
                  ? "Total Shopping"
                  : "Total Payment"}
              </span>
              <span className="font-bold">
                Rp{" "}
                {productInfo.length &&
                  orderDetail.shipping_cost &&
                  (
                    getTotalPrice(productInfo) + orderDetail.shipping_cost
                  ).toLocaleString("id")}
              </span>
            </div>
          </div>
        </div>
        {orderDetail.status &&
        orderDetail.status === "Menunggu Pembayaran" &&
        !modalOrderCancel ? (
          <div className="self-center mb-16">
            <button
              className="mr-2 py-[2px] px-4 bg-red-500 rounded-full text-lg font-semibold shadow-md text-white"
              onClick={() => setModalOrderCancel(!modalOrderCancel)}
            >
              Cancel Order
            </button>
            <button
              className="px-4 py-[2px]  bg-[#82cd47] rounded-full text-lg font-semibold  shadow-md text-white"
              onClick={() => navigate(`/payment/${id}`)}
            >
              Proceed To Payment
            </button>
          </div>
        ) : orderDetail.status && orderDetail.status === "Dikirim" ? (
          <div className="self-center mb-16">
            <button
              className="mr-2 py-[2px] px-4 w-32 bg-blue-500 rounded-full text-lg font-semibold shadow-md text-white"
              onClick={() => setModalOrderComplete(!modalOrderComplete)}
            >
              Confirm
            </button>
            <button
              className="px-4 py-[2px] w-32 bg-[#82cd47] rounded-full text-lg font-semibold  shadow-md text-white"
              onClick={() => navigate(`/order-list`)}
            >
              Back
            </button>
          </div>
        ) : (
          <div className="self-center mb-16">
            <button
              className="px-4 py-[2px] w-32 bg-[#82cd47] rounded-full text-lg font-semibold  shadow-md text-white"
              onClick={() => navigate(`/order-list`)}
            >
              Back
            </button>
          </div>
        )}
      </div>
      {modalOrderCancel ? (
        <div className="container flex justify-center mx-auto">
          <div className="absolute inset-0 flex items-center justify-center bg-gray-700 bg-opacity-20">
            <div className="max-w-sm p-6 bg-white divide-y divide-gray-500 rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl">Cancel Order</h3>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  cursor="pointer"
                  onClick={() => setModalOrderCancel(!modalOrderCancel)}
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
                <p className="mb-4 text-sm mt-4 text-center">
                  Are you sure you want to
                  <br />
                  Cancel this order ?
                </p>
                <div className="flex flex-row justify-center">
                  <button
                    className="px-4 py-1 mx-2 text-white bg-red-400 rounded-md hover:opacity-50"
                    type="submit"
                    onClick={() => setModalOrderCancel(!modalOrderCancel)}
                  >
                    Discard
                  </button>
                  <button
                    className="px-4 py-1 mx-2 text-white bg-blue-400 rounded-md hover:opacity-50"
                    type="submit"
                    onClick={() => {
                      setModalOrderCancel(!modalOrderCancel);
                      handleCancel();
                    }}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {modalOrderComplete ? (
        <div className="container flex justify-center mx-auto">
          <div className="absolute inset-0 flex items-center justify-center bg-gray-700 bg-opacity-20">
            <div className="max-w-sm p-6 bg-white divide-y divide-gray-500 rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl">Complete Order</h3>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  cursor="pointer"
                  onClick={() => setModalOrderComplete(!modalOrderComplete)}
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
                <p className="mb-4 text-sm mt-4 text-center">
                  Has your order delivered?
                  <br />
                  Please confirm to
                  <br />
                  Complete this order ?
                </p>
                <div className="flex flex-row justify-center">
                  <button
                    className="px-4 py-1 mx-2 text-white bg-red-400 rounded-md hover:opacity-50"
                    type="submit"
                    onClick={() => setModalOrderComplete(!modalOrderComplete)}
                  >
                    Discard
                  </button>
                  <button
                    className="px-4 py-1 mx-2 text-white bg-blue-400 rounded-md hover:opacity-50"
                    type="submit"
                    onClick={() => {
                      setModalOrderComplete(!modalOrderComplete);
                      handleComplete();
                    }}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Page>
  );
};

export default OrderDetail;
