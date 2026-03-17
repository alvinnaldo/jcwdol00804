import React, { useEffect, useState } from "react";
import PageAdmin from "../../../Components/PageAdmin";
import BackButtonAdmin from "../../../Components/BackButtonAdmin";
import { BsPlusLg } from "react-icons/bs";
import addImage from "../../../Assets/add-photo.png";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { API_URL } from "../../../helper";
import toast, { Toaster } from "react-hot-toast";

const AddProduct = () => {
  const token = localStorage.getItem("xmart_login");
  const [categoryList, setCategoryList] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_URL}/category/get-categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setCategoryList(res.data.data);
      })
      .catch((err) => {
        console.log(err);
        setCategoryList([]);
      });
  }, [token]);

  const formik = useFormik({
    initialValues: {
      product_img: null,
      category: "",
      product_name: "",
      description: "",
      price: "",
      weight: "",
    },
    validationSchema: Yup.object({
      product_img: Yup.mixed()
        .test("fileSize", "File size is too large. Max size 1MB", (value) =>
          value ? value.size <= 1048576 : true
        )
        .test("fileType", "Unsupported file type", (value) =>
          value
            ? [
                "image/png",
                "image/jpeg",
                "image/jpg",
                "image/gif",
                "image/webp",
                "image/bmp",
                "image/avif"
              ].includes(value.type)
            : true
        )
        .nullable(),
      category: Yup.mixed()
        .oneOf([...categoryList.map((val) => val.name)])
        .required(),
      product_name: Yup.string().max(45, "Max character 45").required("product name is required"),
      description: Yup.string().max(255, "Max character 255").nullable(),
      price: Yup.number().required(),
      weight: Yup.number().required(),
    }),
    onSubmit: (values) => {
      let token = localStorage.getItem("xmart_login");
      if (values.product_img) {
        const formData = new FormData();
        formData.append("images", values.product_img);
        axios
          .post(`${API_URL}/product/admin/add-product`, values, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((res) => {
            axios
              .patch(`${API_URL}/product/admin/add-product-img`, formData, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              })
              .then(() => {
                toast.success(res.data.message);
                formik.resetForm();
              })
              .catch((err) => console.log(err));
          })
          .catch((err) => toast.error(err.response.data.message));
      } else {
        axios
          .post(`${API_URL}/product/admin/add-product`, values, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((res) => {
            toast.success(res.data.message);
            formik.resetForm();
          })
          .catch((err) => {
            console.log(err.response.data.message);
            toast.error(err.response.data.message);
          });
      }
    },
  });

  return (
    <PageAdmin>
      <div className="flex flex-row justify-between px-3">
        <div className="text-gray-800 text-xl font-bold">Add Product</div>
        <BackButtonAdmin />
      </div>
      <Toaster />
      <form className="px-3 py-3 mt-3" onSubmit={formik.handleSubmit}>
        <div className="flex justify-center">
          <input
            id="product_img"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              formik.setFieldValue("product_img", e.target.files[0]);
            }}
          />
          <label htmlFor="product_img">
            <img
              src={
                !formik.errors.product_img && formik.values.product_img
                  ? URL.createObjectURL(formik.values.product_img)
                  : addImage
              }
              alt="thumb"
              className=" w-48 h-48 border cursor-pointer rounded-lg object-cover"
            />
          </label>
        </div>
        {formik.errors.product_img && (
          <div className="text-red-600 text-xs text-center">
            {formik.errors.product_img}
          </div>
        )}
        <div className="mt-10 w-6/12 mx-auto">
          <div className="mt-3 flex">
            <label htmlFor="category" className="w-[33%]">
              Category
            </label>
            <select
              id="category"
              {...formik.getFieldProps("category")}
              className="border px-2 rounded-lg w-[35%]"
            >
              <option value="" hidden>
                Select Category
              </option>
              {categoryList.map((val, idx) => (
                <option key={idx} value={val.name}>
                  {val.name}
                </option>
              ))}
            </select>
          </div>
          {formik.touched.category && formik.errors.category && (
            <div className="text-red-600 text-xs">{formik.errors.category}</div>
          )}
          <div className="mt-3 flex">
            <label htmlFor="product_name" className="w-[33%]">
              Product Name
            </label>
            <input
              type="text"
              id="product_name"
              className="border px-2 rounded-lg w-[60%]"
              {...formik.getFieldProps("product_name")}
            />
          </div>
          {formik.touched.product_name && formik.errors.product_name && (
            <div className="text-red-600 text-xs">
              {formik.errors.product_name}
            </div>
          )}
          <div className="mt-3 flex">
            <label htmlFor="description" className="w-[33%]">
              Description
            </label>
            <textarea
              id="description"
              className="border px-2 rounded-lg w-8/12 h-28"
              {...formik.getFieldProps("description")}
            />
          </div>
          {formik.touched.description && formik.errors.description && (
            <div className="text-red-600 text-xs">
              {formik.errors.description}
            </div>
          )}
          <div className="mt-3 flex">
            <label htmlFor="price" className="w-[33%]">
              Price
            </label>
            <div className="relative">
              <span className="absolute top-0 left-0 text-gray-400 font-bold bg-gray-200 rounded-lg px-2 pb-[2px] overflow-hidden z-10">
                Rp
              </span>
              <input
                type="number"
                id="price"
                className="border pl-10 rounded-lg"
                onKeyDown={(e) =>
                  ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
                }
                {...formik.getFieldProps("price")}
              />
            </div>
          </div>
          {formik.touched.price && formik.errors.price && (
            <div className="text-red-600 text-xs">{formik.errors.price}</div>
          )}
          <div className="mt-3 flex">
            <label htmlFor="weight" className="w-[33%]">
              Weight
            </label>
            <div className="relative">
              <span className="absolute top-0 right-0 text-gray-400 font-bold bg-gray-200 rounded-lg px-2 pb-[2px] overflow-hidden z-10">
                gram
              </span>
              <input
                type="number"
                id="weight"
                className="border pl-2 rounded-lg"
                onKeyDown={(e) =>
                  ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
                }
                {...formik.getFieldProps("weight")}
              />
            </div>
          </div>
          {formik.touched.weight && formik.errors.weight && (
            <div className="text-red-600 text-xs">{formik.errors.weight}</div>
          )}
        </div>
        <div className="flex justify-center">
          <button
            type="submit"
            className="mt-12 px-4 py-2 text-white duration-150 font-medium bg-emerald-700 rounded-lg hover:bg-emerald-600 active:bg-emerald-700"
          >
            <BsPlusLg className="inline mb-1" size={18} /> Product
          </button>
        </div>
      </form>
    </PageAdmin>
  );
};

export default AddProduct;
