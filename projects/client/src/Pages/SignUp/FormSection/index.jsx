import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { API_URL } from "../../../helper";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useState } from "react";

const FormSection = () => {
  const navigate = useNavigate();
  const [eyeOpen, setEyeOpen] = useState(false);
  const [eyeOpen2, setEyeOpen2] = useState(false);
  const [isSubmitting, setisSubmitting] = useState(false);

  const eyeStyle = {
    close: {
      top: "50%",
      cursor: "pointer",
    },
    open: {
      top: "45%",
      cursor: "pointer",
    },
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmpassword: "",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required("Name is required")
        .min(2, "Name should be at least 2 characters")
        .max(45, "Name should not exceed 45 characters"),
      email: Yup.string()
        .required("Email is required")
        .email("Invalid email format")
        .test("Unique Email", "Email already in use", async (value) => {
          if (!value) return true;
          try {
            await axios.get(`${API_URL}/user/unique-email/${value}`);
            return true;
          } catch (error) {
            if (error.response?.data?.message === "Email already in use. please use another email") {
              return false;
            }
            return true;
          }
        }),
      phone: Yup.string()
        .required("Phone number is required")
        .matches(
          /^(\+62|62|0)[2-9]\d{6,10}$/,
          "Invalid Indonesian phone number format (e.g., 081234567890 or +6281234567890)"
        ),
      password: Yup.string()
        .required("Password is required")
        .min(8, "Should be at least 8 characters")
        .matches(/.*[a-z].*/, "Should contain at least 1 lowercase letter")
        .matches(/.*[A-Z].*/, "Should contain at least 1 uppercase letter")
        .matches(/.*[0-9].*/, "Should contain at least 1 number"),
      confirmpassword: Yup.string()
        .required("Confirm password is required")
        .oneOf([Yup.ref("password")], "Passwords don't match"),
    }),
    onSubmit: async (values) => {
      try {
        setisSubmitting(true);
        const result = await axios.post(`${API_URL}/user/sign-up`, values);
        await axios.post(`${API_URL}/cart/add-new-cart`, {
            email: values.email,
          });
          console.log(result);
          setisSubmitting(false);
          alert(result.data.message);
          formik.resetForm();
          navigate("/sign-in");
      } catch (error) {
        console.log(error)
        alert(error.response.data.message);
      }
    },
  });

  return (
    <div className="flex flex-col items-center">
      <div className="text-[#82CD47] font-[600] text-2xl">Sign Up</div>
      <div className="w-full mt-2">
        <form
          onSubmit={formik.handleSubmit}
          className="flex flex-col items-center"
        >
          <div className="w-9/12">
            <label
              htmlFor="name"
              className="text-[20px] opacity-50 place-self-start"
            >
              Name
            </label>
            <input
              className="block border-[#82CD47] border rounded-md w-full h-[35px] px-[16px] "
              id="name"
              name="name"
              type="text"
              {...formik.getFieldProps("name")}
              placeholder="Username"
            />
            {formik.touched.name && formik.errors.name && (
              <div className="text-red-600 text-xs">{formik.errors.name}</div>
            )}
          </div>
          <div className="w-9/12">
            <label htmlFor="email" className="text-[20px] opacity-50 mt-2">
              Email
            </label>
            <input
              className="block border-[#82CD47] border rounded-md w-full h-[35px] px-[16px]"
              id="email"
              name="email"
              type="email"
              {...formik.getFieldProps("email")}
              placeholder="youremail@email.com"
            />
            {formik.touched.email && formik.errors.email && (
              <div className="text-red-600 text-xs">{formik.errors.email}</div>
            )}
          </div>
          <div className="w-9/12">
            <label htmlFor="phone" className="text-[20px] opacity-50 mt-2">
              Phone Number
            </label>
            <input
              className="block border-[#82CD47] border rounded-md w-full h-[35px] px-[16px]"
              id="phone"
              name="phone"
              type="text"
              {...formik.getFieldProps("phone")}
              placeholder="e.g. 081234567890 or +6281234567890"
            />
            {formik.touched.phone && formik.errors.phone && (
              <div className="text-red-600 text-xs">{formik.errors.phone}</div>
            )}
          </div>
          <div className="w-9/12 relative">
            <label htmlFor="password" className="text-[20px] opacity-50 mt-2">
              Password
            </label>
            <input
              className="block border-[#82CD47] border rounded-md w-full h-[35px] px-[16px]"
              id="password"
              name="password"
              type={eyeOpen ? "text" : "password"}
              {...formik.getFieldProps("password")}
              placeholder="▪️▪️▪️▪️▪️▪️▪️▪️▪️▪️▪️▪️"
            />
            {eyeOpen ? (
              <AiOutlineEye
                className="absolute right-3"
                fontSize={25}
                color="gray"
                style={formik.errors.password ? eyeStyle.open : eyeStyle.close}
                onClick={() => setEyeOpen(!eyeOpen)}
              />
            ) : (
              <AiOutlineEyeInvisible
                className="absolute right-3"
                fontSize={25}
                color="gray"
                style={formik.errors.password ? eyeStyle.open : eyeStyle.close}
                onClick={() => setEyeOpen(!eyeOpen)}
              />
            )}
            {formik.touched.password && formik.errors.password && (
              <div className="text-red-600 text-xs">
                {formik.errors.password}
              </div>
            )}
          </div>
          <div className="w-9/12 relative">
            <label
              htmlFor="confirmpassword"
              className="text-[20px] opacity-50 mt-2"
            >
              Confirm Password
            </label>
            <input
              className="block border-[#82CD47] border rounded-md w-full h-[35px] px-[16px]"
              id="confirmpassword"
              name="confirmpassword"
              type={eyeOpen2 ? "text" : "password"}
              {...formik.getFieldProps("confirmpassword")}
              placeholder="▪️▪️▪️▪️▪️▪️▪️▪️▪️▪️▪️▪️"
            />
            {eyeOpen2 ? (
              <AiOutlineEye
                className="absolute right-3"
                fontSize={25}
                color="gray"
                style={
                  formik.errors.confirmpassword ? eyeStyle.open : eyeStyle.close
                }
                onClick={() => setEyeOpen2(!eyeOpen2)}
              />
            ) : (
              <AiOutlineEyeInvisible
                className="absolute right-3"
                fontSize={25}
                color="gray"
                style={
                  formik.errors.confirmpassword ? eyeStyle.open : eyeStyle.close
                }
                onClick={() => setEyeOpen2(!eyeOpen2)}
              />
            )}
            {formik.touched.confirmpassword &&
              formik.errors.confirmpassword && (
                <div className="text-red-600 text-xs">
                  {formik.errors.confirmpassword}
                </div>
              )}
          </div>
          {isSubmitting ? (
            <button
              className="rounded-full bg-[#82CD47] w-8/12 h-[38px] text-white mt-6 text-[22px] font-[600] flex flex-row items-center justify-center shadow-md"
              disabled
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
              Registering...
            </button>
          ) : (
            <button
              type="submit"
              className="rounded-full bg-[#82CD47] w-8/12 h-[38px] text-white mt-6 text-[22px] font-[600] leading-6 shadow-md"
            >
              Sign Up
            </button>
          )}
        </form>
        <div className="text-center mt-2">
          Already have an account ?{" "}
          <Link to="/sign-in">
            <span className="text-[#689C36]">Sign in</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FormSection;
