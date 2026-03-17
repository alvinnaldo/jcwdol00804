import { useEffect, useState } from "react";
import axios from "axios";
import PageAdmin from "../../../../Components/PageAdmin";
import { useParams } from "react-router-dom";
import { API_URL } from "../../../../helper";
import { format } from "date-fns";
import { FcShop } from "react-icons/fc";
import img from "../../../../Assets/default.png";
import { useSelector } from "react-redux";
import BackButtonAdmin from "../../../../Components/BackButtonAdmin";
import toast, { Toaster } from "react-hot-toast";

const ManageOrderDetail = () => {
  const { branch_name } = useSelector((state) => {
    return {
      branch_name: state.userReducer.branch_name,
    };
  });
  const { id } = useParams();
  const [orderDetail, setOrderDetail] = useState([]);
  const [productInfo, setProductInfo] = useState([]);
  const [showModalImage, setShowModalImage] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [modalPaymentAccept, setModalPaymentAccept] = useState(false);
  const [modalPaymentRefuse, setModalPaymentRefuse] = useState(false);
  const [modalOrderSend, setModalOrderSend] = useState(false);
  const [modalOrderCancel, setModalOrderCancel] = useState(false);

  const getTotalPrice = (arr) => {
    return arr.map((val) => val.price * val.quantity).reduce((p, c) => p + c);
  };

  const handleModalOpen = (imageUrl) => {
    setShowModalImage(true);
    setModalImage(imageUrl);
  };

  const handleModalClose = () => {
    setShowModalImage(false);
    setModalImage(null);
  };

  const getDetail = async () => {
    let promise1 = axios.get(
      `${API_URL}/transaction/order-list-branch-admin/${id}`
    );
    let promise2 = axios.get(`${API_URL}/transaction/get-product-info/${id}`);

    Promise.all([promise1, promise2])
      .then((res) => {
        setOrderDetail(res[0].data[0]);
        setProductInfo(res[1].data);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAccept = async () => {
    try {
      const result = await axios.patch(
        `${API_URL}/transaction/accept-payment/${id}`
      );
      toast.success(result.data.message);
      getDetail();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const handleRefuse = async () => {
    try {
      const result = await axios.patch(
        `${API_URL}/transaction/refuse-payment/${id}`
      );
      toast.error(result.data.message);
      getDetail();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const handleSendOrder = async () => {
    try {
      const result = await axios.patch(
        `${API_URL}/transaction/send-order/${id}`
      );
      toast.success(result.data.message);
      getDetail();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const handleCancelOrder = async () => {
    try {
      const result = await axios.patch(
        `${API_URL}/transaction/cancel-order/${id}`
      );
      toast.error(result.data.message);
      getDetail();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  return (
    <PageAdmin>
      <div className="items-start justify-between flex">
        <Toaster />
        <h3 className="text-gray-800 text-xl font-bold">
          <FcShop className="inline mb-1" size={25} /> {branch_name} Order
          Details
        </h3>
        <BackButtonAdmin />
      </div>
      <div className="flex justify-start mt-10">
        <div className="mr-5 w-[30%]">
          {/* Status */}
          <div className="rounded-xl shadow-md border py-3 mb-2">
            <div className="font-bold px-5 text-lg">
              {orderDetail.invoice_no && orderDetail.invoice_no}
            </div>
            <div className="h-[1px] bg-slate-200 w-[95%] mt-2 ml-3"></div>
            <div className="text-sm font-bold text-slate-400 px-5 mt-2">
              Username : {orderDetail.user_name && orderDetail.user_name}
            </div>
            <div className="text-sm font-bold text-slate-400 px-5 mt-1">
              Status : {orderDetail.status && orderDetail.status}
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
          {/* Payment Detail */}
          <div className="rounded-xl shadow-md border py-3 mb-2">
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
        <div className="mr-5 w-[40%]">
          {/* Payment Image */}
          <div className="rounded-xl shadow-md border py-3 mb-2">
            <div className="flex flex-col">
              <div className="px-5 font-bold">Payment Receipt</div>
              <div className="h-[1px] bg-slate-200 w-[95%] mt-1 ml-3"></div>
              {orderDetail.payment_img == null ? (
                <div className="px-5">Status : Belum di upload</div>
              ) : (
                <div className="text-sm font-bold text-slate-400 px-5 mt-2">
                  Status : Uploaded
                </div>
              )}
              <div className="h-[1px] bg-slate-200 w-[95%] mt-1 ml-3"></div>
              {orderDetail.payment_img == null ? (
                <div className="flex justify-center pt-2">
                  <img
                    src={img}
                    alt="default"
                    className="w-[300px] h-[300px]"
                  />
                </div>
              ) : (
                <div className="flex justify-center pt-2">
                  <img
                    src={
                      orderDetail.payment_img &&
                      `http://localhost:8000/${orderDetail.payment_img}`
                    }
                    alt="payment_img"
                    className="w-[300px] h-[300px]"
                    onClick={() =>
                      handleModalOpen(
                        orderDetail.payment_img &&
                          `http://localhost:8000/${orderDetail.payment_img}`
                      )
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="w-[30%]">
          {/* Product Detail & Delivery Info */}
          <div className="rounded-xl shadow-md border py-3 mb-2">
            <div className="flex flex-row justify-between items-center ">
              <div className="font-bold px-5">Product Details</div>
              <span className="px-5 font-bold text-slate-400">
                <FcShop className="mb-1 mr-1 inline" />
                {productInfo.length && productInfo[0].branch_name}
              </span>
            </div>
            <div className="h-[1px] bg-slate-200 w-[95%] mt-1 ml-3"></div>
            {productInfo.map((value,idx) => (
              <div
                key={idx}
                className="flex flex-row items-center justify-between px-5"
              >
                <div className="flex flex-row items-center mt-1 ">
                  <img
                    src={`http://localhost:8000/${value.product_img}`}
                    alt={value.name}
                    className=" w-12 h-12 mt-2 border text-xs"
                  />
                  <div className="flex flex-col ml-2">
                    <span className="font-bold text-sm w-[210px] mt-3" class="overflow-hidden">
                      {value.name}
                    </span>
                    <span className="text-[#6CC51D] font-bold text-sm">
                      {value.quantity} x Rp {value.price.toLocaleString("id")}
                    </span>
                  </div>
                </div>
                <div className="font-bold text-[#6CC51D]">
                  Rp {(value.quantity * value.price).toLocaleString("id")}
                </div>
              </div>
            ))}
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
        </div>
      </div>
      {/* Button */}
      <div className="flex flex-col justify-center mt-10">
        {orderDetail.status === "Menunggu Konfirmasi Pembayaran" &&
        !modalPaymentAccept &&
        !modalPaymentRefuse ? (
          <div className="flex justify-center mb-5">
            <button
              type="submit"
              className="rounded-md bg-blue-400 w-[200px] h-[36px]
                                        text-white text-xl font-[500]
                                        leading-6 shadow-md
                                        hover:opacity-50 mx-2"
              onClick={() => setModalPaymentAccept(!modalPaymentAccept)}
            >
              Accept
            </button>
            <button
              type="submit"
              className="rounded-md bg-red-400 w-[200px] h-[36px]
                                        text-white text-xl font-[500]
                                        leading-6 shadow-md
                                        hover:opacity-50 mx-2"
              onClick={() => setModalPaymentRefuse(!modalPaymentRefuse)}
            >
              Refuse
            </button>
          </div>
        ) : orderDetail.status === "Diproses" &&
          !modalPaymentAccept &&
          !modalPaymentRefuse ? (
          <div className="flex justify-center mb-5">
            <button
              type="submit"
              className="rounded-md bg-blue-400 w-[200px] h-[36px]
                                        text-white text-xl font-[500]
                                        leading-6 shadow-md
                                        hover:opacity-50 mx-2"
              onClick={() => setModalOrderSend(!modalOrderSend)}
            >
              Send Order
            </button>
            <button
              type="submit"
              className="rounded-md bg-red-400 w-[200px] h-[36px]
                                        text-white text-xl font-[500]
                                        leading-6 shadow-md
                                        hover:opacity-50 mx-2"
              onClick={() => setModalOrderCancel(!modalOrderCancel)}
            >
              Cancel Order
            </button>
          </div>
        ) : null}
      </div>
      {/* Image modal */}
      {showModalImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none"
          onClick={handleModalClose}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
          <div className="w-auto my-6 mx-auto max-w-2xl relative z-10">
            <img
              src={modalImage}
              alt="payment_img"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
      {/* Modal Payment Accept */}
      {modalPaymentAccept ? (
        <div className="flex justify-center mx-auto">
          <div className="absolute inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50">
            <div className="max-w-sm p-6 bg-white divide-y divide-gray-500 rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl mr-2">Accept Payment Receipt</h3>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  cursor="pointer"
                  onClick={() => setModalPaymentAccept(!modalPaymentAccept)}
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
                  Accept this payment receipt?
                </p>
                <div className="flex flex-row justify-center">
                  <button
                    className="px-4 py-1 mx-2 text-white bg-red-400 rounded-md hover:opacity-50"
                    type="submit"
                    onClick={() => setModalPaymentAccept(!modalPaymentAccept)}
                  >
                    Discard
                  </button>
                  <button
                    className="px-4 py-1 mx-2 text-white bg-blue-400 rounded-md hover:opacity-50"
                    type="submit"
                    onClick={() => {
                      setModalPaymentAccept(!modalPaymentAccept);
                      handleAccept();
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
      {/* Modal Payment Refuse */}
      {modalPaymentRefuse ? (
        <div className="flex justify-center mx-auto">
          <div className="absolute inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50">
            <div className="max-w-sm p-6 bg-white divide-y divide-gray-500 rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl mr-2">Refuse Payment Receipt</h3>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  cursor="pointer"
                  onClick={() => setModalPaymentRefuse(!modalPaymentRefuse)}
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
                  Refuse this payment receipt?
                </p>
                <div className="flex flex-row justify-center">
                  <button
                    className="px-4 py-1 mx-2 text-white bg-red-400 rounded-md hover:opacity-50"
                    type="submit"
                    onClick={() => setModalPaymentRefuse(!modalPaymentRefuse)}
                  >
                    Discard
                  </button>
                  <button
                    className="px-4 py-1 mx-2 text-white bg-blue-400 rounded-md hover:opacity-50"
                    type="submit"
                    onClick={() => {
                      setModalPaymentRefuse(!modalPaymentRefuse);
                      handleRefuse();
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
      {/* Modal Send Order */}
      {modalOrderSend ? (
        <div className="flex justify-center mx-auto">
          <div className="absolute inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50">
            <div className="max-w-sm p-6 bg-white divide-y divide-gray-500 rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl mr-2">Send Order</h3>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  cursor="pointer"
                  onClick={() => setModalOrderSend(!modalOrderSend)}
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
                  Send this order?
                </p>
                <div className="flex flex-row justify-center">
                  <button
                    className="px-4 py-1 mx-2 text-white bg-red-400 rounded-md hover:opacity-50"
                    type="submit"
                    onClick={() => setModalOrderSend(!modalOrderSend)}
                  >
                    Discard
                  </button>
                  <button
                    className="px-4 py-1 mx-2 text-white bg-blue-400 rounded-md hover:opacity-50"
                    type="submit"
                    onClick={() => {
                      setModalOrderSend(!modalOrderSend);
                      handleSendOrder();
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
      {/* Modal Cancel Order */}
      {modalOrderCancel ? (
        <div className="flex justify-center mx-auto">
          <div className="absolute inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50">
            <div className="max-w-sm p-6 bg-white divide-y divide-gray-500 rounded-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl mr-2">Cancel Order</h3>
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
                  Cancel this order?
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
                      handleCancelOrder();
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
    </PageAdmin>
  );
};

export default ManageOrderDetail;
