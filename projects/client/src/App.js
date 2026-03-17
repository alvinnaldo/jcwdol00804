import React, { useEffect, useState } from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Home from "./Pages/Home";
import SignUp from "./Pages/SignUp";
import SignIn from "./Pages/SignIn";
import Verify from "./Pages/Verify";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import PersonalData from "./Pages/PersonalData";
import ProfileSetting from "./Pages/ProfileSetting";
import ChangePassword from "./Pages/ChangePassword";
import MyAddress from "./Pages/MyAddress";
import AddAddress from "./Pages/AddAddress";
import EditAddress from "./Pages/EditAddress";
import ProductList from "./Pages/ProductList";
import ProductDetail from "./Pages/ProductDetail";
import NotFound from "./Pages/NotFound";
import Axios from "axios";
import { API_URL } from "./helper";
import { loginAction } from "./Actions/user";
import MyCart from "./Pages/MyCart";
import { getCartList } from "./Actions/cart";
import RestrictedRoutes from "./Utils/RestrictedRoutes";
import OrderConfirmation from "./Pages/OrderConfirmation";
import Payment from "./Pages/Payment";
import OrderList from "./Pages/OrderList";
import OrderDetail from "./Pages/OrderDetail";
import AdminHome from "./Pages/Admin/Home";
import ManageBranch from "./Pages/Admin/ManageBranch";
import AddBranchAdmin from "./Pages/Admin/ManageBranch/AddBranchAdmin";
import ManageCategory from "./Pages/Admin/ManageCategory";
import CustomizeCategory from "./Pages/Admin/ManageCategory/CustomizeCategory";
import OrderReport from "./Pages/Admin/OrderReport";
import ManageOrder from "./Pages/Admin/ManageOrder";
import ManageOrderDetail from "./Pages/Admin/ManageOrder/ManageOrderDetail";
import ManageProduct from "./Pages/Admin/ManageProduct";
import AddProduct from "./Pages/Admin/AddProduct";
import EditProduct from "./Pages/Admin/EditProduct";
import StockMovementReport from "./Pages/Admin/StockMovementReport";
import { Toaster } from "react-hot-toast";

function App() {
  const dispatch = useDispatch();

  const { role_id } = useSelector((state) => {
    return {
      role_id: state.userReducer.role_id,
    };
  });

  const [spinner, setSpinner] = useState(false);

  const keepLogin = () => {
    let getLocalStorage = localStorage.getItem("xmart_login");
    if (getLocalStorage) {
      Axios.get(`${API_URL}/user/keep-login`, {
        headers: {
          Authorization: `Bearer ${getLocalStorage}`,
        },
      })
        .then((res) => {
          localStorage.setItem("xmart_login", res.data.token);
          dispatch(loginAction(res.data));
          dispatch(getCartList());
          setSpinner(true);
        })
        .catch((err) => {
          if (err.response.status === 401) {
            localStorage.removeItem("xmart_login");
            setSpinner(true);
          }
          console.log(err);
        });
    } else {
      setSpinner(true);
    }
  };

  useEffect(() => {
    keepLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
    <Toaster />
      {spinner ? (
        <Routes>
          {!role_id ? (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<Verify />} />
              <Route path="/product-detail/:id" element={<ProductDetail />} />
              <Route path="/product-list" element={<ProductList />} />
              <Route path="*" element={<NotFound />} />
            </>
          ) : null}
          {role_id === 1 ? (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/product-detail/:id" element={<ProductDetail />} />
              <Route path="/product-list" element={<ProductList />} />
              <Route path="/verify-email" element={<Verify />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route path="/personal-data" element={<PersonalData />} />
              <Route path="/my-cart" element={<MyCart />} />
              <Route path="/profile-setting" element={<ProfileSetting />} />
              <Route path="/my-address" element={<MyAddress />} />
              <Route path="/add-address" element={<AddAddress />} />
              <Route path="/edit-address/:id" element={<EditAddress />} />
              <Route element={<RestrictedRoutes />}>
                <Route path="/payment/:id" element={<Payment />} />
                <Route path="/order-list" element={<OrderList />} />
                <Route path="/order-detail/:id" element={<OrderDetail />} />
                <Route
                  path="/order-confirmation"
                  element={<OrderConfirmation />}
                />
                <Route path="*" element={<NotFound />} />
              </Route>
            </>
          ) : null}
          {role_id === 2 ? (
            <>
              <Route path="/admin" element={<AdminHome />} />
              <Route
                path="/admin/manage-category"
                element={<ManageCategory />}
              />
              <Route
                path="/admin/manage-category/:id"
                element={<CustomizeCategory />}
              />
              <Route path="/admin/manage-order" element={<ManageOrder />} />
              <Route
                path="/admin/manage-order/:id"
                element={<ManageOrderDetail />}
              />
              <Route path="/admin/manage-product" element={<ManageProduct />} />
              <Route path="/admin/add-product" element={<AddProduct />} />
              <Route path="/admin/edit-product/:id" element={<EditProduct />} />
              <Route
                path="/admin/stock-movement-report"
                element={<StockMovementReport />}
              />
              <Route path="*" element={<NotFound />} />
            </>
          ) : null}
          {role_id === 3 ? (
            <>
              <Route path="/admin" element={<AdminHome />} />
              <Route path="/admin/manage-branch" element={<ManageBranch />} />
              <Route
                path="/admin/add-branch-admin"
                element={<AddBranchAdmin />}
              />
              <Route path="/admin/order-report" element={<OrderReport />} />
              <Route path="*" element={<NotFound />} />
            </>
          ) : null}
        </Routes>
      ) : (
        // Spinner
        <svg
          className="w-10 h-10 fixed top-[50%] left-[50%] animate-spin inline text-emerald-200 "
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
      )}
    </>
  );
}

export default App;
