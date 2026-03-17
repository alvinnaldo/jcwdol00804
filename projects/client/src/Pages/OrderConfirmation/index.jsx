import React, { useState, useEffect } from "react";
import Page from "../../Components/Page";
import BackButton from "../../Components/BackButton";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FcShop } from "react-icons/fc";
import ModalAddress from "./ModalAddress";
import ModalCourier from "./ModalCourier";
import axios from "axios";
import { API_URL } from "../../helper";
import toast, { Toaster } from "react-hot-toast";
// import { BsValentine2 } from "react-icons/bs";

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isModalAddress, setIsModalAddress] = useState(false);
  const [isModalCourier, setIsModalCourier] = useState(false);
  const [addressList, setAddressList] = useState([]);
  const [address, setAddress] = useState({});
  const [courierList, setCourierList] = useState([]);
  const [courier, setCourier] = useState({});
  const [isSubmitting, setisSubmitting] = useState(false);

  const token = localStorage.getItem("xmart_login");

  useEffect(() => {
    axios
      .get(`${API_URL}/address/my-address`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.data.length === 0) {
          setAddressList([]);
          setAddress({});
        } else {
          setAddressList(res.data);
          setAddress(res.data[0]);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [token]);

  useEffect(() => {
    setCourierList([]);
    if (Object.keys(address).length !== 0) {
      axios
        .get(
          `${API_URL}/address/available-courier?origin=${location.state.shopCityName}&destination=${address.city}&weight=${location.state.totalWeight}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => {
          setCourierList(res.data);
        });
    }
  }, [address, location.state.shopCityName, location.state.totalWeight, token]);

  const handleSubmit = () => {
    if (
      Object.keys(address).length !== 0 &&
      Object.keys(courier).length !== 0
    ) {
      setisSubmitting(true);
      let promise1 = axios.patch(
        `${API_URL}/product/adjust-stock-after-order`,
        { items: location.state.items },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      let promise2 = axios.patch(
        `${API_URL}/cart/delete-cart-item-after-order`,
        { items: location.state.items },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      let promise3 = axios.post(
        `${API_URL}/order/create-new-order`,
        {
          items: location.state.items,
          address_id: address.id,
          courier: `${courier.name} - ${courier.description} (${courier.service}) - ETA : ${courier.etd}`,
          shipping_cost: courier.cost,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Promise.all([promise1, promise2, promise3])
        .then((res) => {
          setisSubmitting(false);
          navigate(`/order-detail/${res[2].data.data}`, { replace: true , state : {}});
        })
        .catch((err) => console.log(err));
    } else {
      toast.error("Address and courier may not be empty");
    }
  };

  return (
    <Page isFooter={false} isNavbar={false}>
      <ModalAddress
        isModalAddress={isModalAddress}
        addressList={addressList}
        modalOpener={setIsModalAddress}
        setAddress={setAddress}
        setCourier={setCourier}
      />
      <ModalCourier
        isModalCourier={isModalCourier}
        courierList={courierList}
        modalOpener={setIsModalCourier}
        setCourier={setCourier}
      />
      <Toaster />
      <div className="relative">
        <BackButton />
        <div className="text-center text-xl py-5 font-bold z-10 relative">
          Order Confirmation
        </div>
      </div>
      <div className="flex flex-col justify-center items-start">
        <div className="flex flex-col px-5 mt-2">
          {/* Card */}
          {/* Order Details and Delivery Details */}
          <div className="container rounded-xl shadow-md border h-min-[200px] w-[440px] py-3 mb-8">
            <div className="flex flex-row justify-between items-center ">
              <div className="font-bold px-5">Order Details</div>
              <span className="px-5 font-bold text-slate-400">
                <FcShop className="mb-1 mr-1 inline" />
                {location.state.shopName}
              </span>
            </div>
            <div className="h-[1px] bg-slate-200 w-[95%] mt-1 ml-3"></div>
            {location.state.items.map((val2, idx2) => {
              return (
                <div
                  className="flex flex-row items-center justify-between px-5"
                  key={idx2}
                >
                  <div className="flex flex-row items-center mt-1 ">
                    <img
                      src={`http://localhost:8000/${val2.product_img}`}
                      alt={val2.name}
                      className=" w-12 h-12 mt-2 border text-xs"
                    />
                    <div className="flex flex-col ml-2">
                      <span className="font-bold text-sm w-[210px]">
                        {val2.name}
                      </span>
                      <span className="text-[#6CC51D] font-bold text-sm">
                        {val2.quantity} x Rp {val2.price.toLocaleString("id")}
                      </span>
                    </div>
                  </div>
                  <div className="font-bold text-[#6CC51D]">
                    Rp {(val2.price * val2.quantity).toLocaleString("id")}
                  </div>
                </div>
              );
            })}
            <div className="h-[6px] bg-slate-200 w-[100%] mt-3 mb-2 "></div>
            <div className="flex flex-col">
              <div className="font-bold px-5">Delivery Details</div>
              <div className="h-[1px] bg-slate-200 w-[95%] mt-1 ml-3"></div>
              <div className="flex flex-row justify-between items-center px-5 mt-3">
                <span className="text-[#6CC51D] font-bold">Address</span>
                <div
                  className="w-[50%] border rounded-full bg-slate-100 border-[#6CC51D]  text-center cursor-pointer"
                  onClick={() => setIsModalAddress(!isModalAddress)}
                >
                  Select address
                </div>
              </div>
              <div className="px-5 max-h-[80px] mt-2 address">
                {Object.keys(address).length !== 0 ? (
                  <>
                    {address.is_main ? (
                      <span className="block text-xs bg-red-500/[.5] text-center w-[22%] rounded-full font-semibold">
                        Main Address
                      </span>
                    ) : null}
                    {address.address}
                    <span className="block">{`${address.city}, ${address.province}, ${address.zipcode}`}</span>
                  </>
                ) : (
                  <>
                    <div className="text-red-500">
                      You don't have an address yet.
                    </div>
                    <Link
                      to="/add-address"
                      className="px-5 py-[1px] bg-emerald-200 rounded-lg font-[600] mt-1"
                    >
                      Add Address
                    </Link>
                  </>
                )}
              </div>
              <div className="flex flex-col px-5 mt-4 mb-2">
                <div className="flex flex-row justify-between items-center">
                  <span className="text-[#6CC51D] font-bold">Courier</span>
                  <div
                    className="w-[50%] border rounded-full bg-slate-100 border-[#6CC51D] text-center cursor-pointer"
                    onClick={() => setIsModalCourier(!isModalCourier)}
                  >
                    Select available courier
                  </div>
                </div>
                {Object.keys(courier).length !== 0 && (
                  <>
                    <div className="mt-2 font-bold">{courier.name}</div>
                    <div>
                      {courier.description} ({courier.service}) - Rp{" "}
                      {courier.cost.toLocaleString("id")} (ETA :{" "}
                      {courier.etd})
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          {/* Voucher */}
          <div className="container rounded-xl shadow-md border h-min-[200px] w-[440px] py-3 mb-8 ">
            <div className="flex flex-row justify-between items-center px-5">
              <span className="font-bold">Voucher</span>
              <div className="w-[50%] border rounded-full bg-slate-100 border-[#6CC51D]  text-center cursor-pointer">
                Select voucher
              </div>
            </div>
          </div>
          {/* Shopping Summary */}
          <div className="container rounded-xl shadow-md border h-min-[200px] w-[440px] py-3 mb-2 ">
            <div className="flex flex-col">
              <div className="px-5 font-bold">Shopping Summary</div>
              <div className="h-[1px] bg-slate-200 w-[95%] mt-1 ml-3"></div>
              <div className="flex flex-row justify-between px-5 mt-2">
                <span>
                  Total Price{" "}
                  {`(${location.state.items.length} ${
                    location.state.items.length > 1 ? "items" : "item"
                  })`}
                </span>
                <span>Rp {location.state.totalPrice.toLocaleString("id")}</span>
              </div>
              <div className="flex flex-row justify-between px-5 mt-2">
                <span>
                  Total Delivery Cost{" "}
                  {`(${location.state.totalWeight.toLocaleString("id")} gram)`}
                </span>
                <span>
                  Rp{" "}
                  {Object.keys(courier).length !== 0
                    ? courier.cost.toLocaleString("id")
                    : 0}
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
              <span className="font-bold">Total Shopping</span>
              <span className="font-bold">
                Rp{" "}
                {location.state.totalPrice <= 0
                  ? "0"
                  : (
                      location.state.totalPrice +
                      (Object.keys(courier).length !== 0 &&
                        courier.cost)
                    ).toLocaleString("id")}
              </span>
            </div>
          </div>
        </div>
        {isSubmitting ? (
          <button
            disabled
            className="bg-[#82cd47] h-[38px] w-8/12 rounded-full px-3 mt-10 mb-16 self-center text-[22px] font-[600] shadow-md text-white"
          >
            <svg
              className="w-10 h-10 mr-1 animate-spin inline text-white"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 4.75V6.25"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
              <path
                d="M17.1266 6.87347L16.0659 7.93413"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
              <path
                d="M19.25 12L17.75 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
              <path
                d="M17.1266 17.1265L16.0659 16.0659"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
              <path
                d="M12 17.75V19.25"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
              <path
                d="M7.9342 16.0659L6.87354 17.1265"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
              <path
                d="M6.25 12L4.75 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
              <path
                d="M7.9342 7.93413L6.87354 6.87347"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="bg-[#82cd47] h-[38px] w-8/12 rounded-full px-3 mt-10 mb-16 self-center text-[22px] font-[600] shadow-md text-white"
          >
            Proceed To Payment
          </button>
        )}
      </div>
    </Page>
  );
};

export default OrderConfirmation;
