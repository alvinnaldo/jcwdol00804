import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { BiUser, BiKey, BiHome, BiLogOutCircle } from "react-icons/bi";
import { IoIosArrowForward } from "react-icons/io";
import { logoutAction } from "../../../../Actions/user";

const SettingSection = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutClick = () => {
    // localStorage.removeItem("xmart_login");
    dispatch(logoutAction());
    navigate("/sign-in");
  };

  return (
    <div className="flex flex-col justify-center mx-20 my-10">
      <div className="text-xl font-bold mb-2">Settings</div>
      <div className="h-[2px] bg-slate-200 w-[100%] mb-2"></div>
      <Link
        className="flex justify-between px-2 font-semibold my-2"
        to="/personal-data"
      >
        <BiUser className="my-auto" size={25} />
        <div className="my-auto pl-2 pr-32">Personal Data</div>
        <IoIosArrowForward className="my-auto" size={22} />
      </Link>
      <Link
        className="flex justify-between px-2 font-semibold my-3"
        to="/change-password"
      >
        <BiKey className="my-auto" size={25} />
        <div className="my-auto pl-4 pr-28">Change Password</div>
        <IoIosArrowForward className="my-auto" size={22} />
      </Link>
      <Link
        className="flex justify-between px-2 font-semibold my-3"
        to="/my-address"
      >
        <BiHome className="my-auto" size={25} />
        <div className="my-auto pl-2 pr-36">My Address</div>
        <IoIosArrowForward className="my-auto" size={22} />
      </Link>
      <button className="flex justify-between px-2 font-semibold my-3" onClick={logoutClick}>
        <BiLogOutCircle className="my-auto" size={25} />
        <div className="my-auto pr-40">Sign out</div>
        <IoIosArrowForward
          className="my-auto"
          size={22}
          onClick={logoutClick}
        />
      </button>
    </div>
  );
};

export default SettingSection;
