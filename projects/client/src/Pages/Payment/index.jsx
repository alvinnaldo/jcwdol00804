import React, { useEffect, useState } from "react";
import Page from "../../Components/Page";
import BackButton from "../../Components/BackButton";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../helper";
import { format, differenceInSeconds } from "date-fns";
import { useFormik } from "formik";
import * as Yup from "yup";
import success from "../../Assets/Verify.png"
import toast, { Toaster } from "react-hot-toast";

const Payment = () => {
  const [paymentDetail, setPaymentDetail] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);

  const navigate = useNavigate();

  const { id } = useParams();
  const getPayment = async () => {
    try {
      const token = localStorage.getItem("xmart_login");
      const result = await axios.get(`${API_URL}/order/payment/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPaymentDetail(result.data[0]);
    } catch (error) {
      alert(error.response.data.message);
    };
  };

  useEffect(() => {
    getPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = differenceInSeconds(
        new Date(),
        new Date(paymentDetail.created_at)
      );
      // use + 61200(17hours) it might be because of timezone
      setTimeLeft(Math.max((0, 86400 - diff) + 61200));
    }, 1000);
    return () => clearInterval(interval);
  }, [paymentDetail]);

  const formik = useFormik({
    initialValues: {
      images: null,
    },
    validationSchema: Yup.object().shape({
      images: Yup.mixed()
        .test("fileSize", "File size is too large. Max size 1MB", (value) =>
          value ? value.size <= 1048576 : true
        )
        .test("fileType", "Unsupported file type", (value) =>
          value
            ? ["image/png", "image/jpeg", "image/jpg"].includes(
              value.type
            )
            : true
        )
        .nullable()
      ,
    }),
    onSubmit: async (values) => {
      const formData = new FormData();
      formData.append("images", values.images);
      try {
        const result = await axios.patch(
          `${API_URL}/order/upload-payment/${id}`,
          formData
        );
        toast.success(result.data.message);
        getPayment();
      } catch (error) {
        toast.error(error.response.data.message);
      }
    },
  });

  return (
    <Page isFooter={false} isNavbar={false}>
      <div className="relative">
        <BackButton />
        <Toaster />
        <div className="text-center text-xl py-5 font-bold z-10 relative">
          Payment
        </div>

        {/* Container Content */}
        <div className="container flex flex-col justify-center items-start px-5 mt-2">
          {/* Payment Detail */}
          <div className="container rounded-xl shadow-md border h-min-[200px] w-[440px] py-3 mb-5 ">
            <div className="text-slate-400  text-center px-5 font-bold">
              {paymentDetail.invoice_no}
            </div>
            <div className="text-slate-400  text-center px-5 font-bold">
              Order Date : {" "}
              {paymentDetail.created_at &&
                format(
                  new Date(paymentDetail.created_at),
                  "d MMM yyyy, HH:mm (O)"
                )}
            </div>
            <div className="text-[#86C649] text-xl text-center px-5 font-bold">
              Total Payment : Rp.
              {Number(paymentDetail.total_purchased).toLocaleString('id')},-
            </div>
          </div>
          {/* Time limit */}
          <div className="container rounded-xl shadow-md border h-min-[200px] w-[440px] py-3 mb-5 ">
            {
              paymentDetail.payment_img === null ?
                (
                  <div>
                    <div className="font-bold px-5 text-center">
                      Payment Time Left Before Canceled
                    </div>
                    <div className="text-[40px] text-red-500 text-center font-bold">
                      {
                        timeLeft > 0 ?
                          `${format(new Date(timeLeft * 1000), "HH:mm:ss")}`
                          : "00:00:00"
                      }
                    </div>
                  </div>
                ) : (
                  <div className="font-bold text-[#86C649] px-5 text-center">
                    Payment Receipt Uploaded
                  </div>
                )
            }
          </div>
          {/* Upload field */}
          <div className="container rounded-xl shadow-md border h-min-[200px] w-[440px] py-3 mb-10">
            {
              paymentDetail.payment_img === null ?
                (
                  <div className="form">
                    <form onSubmit={formik.handleSubmit}>
                      <div className="flex flex-col items-center">
                        <label
                          htmlFor="images"
                          className="text-lg font-bold text-slate-400 mb-1"
                        >
                          Upload Receipt
                        </label>
                        <div className="rounded bg-white border shadow-md text-sm inline-block px-5 py-1 my-5">
                          <input
                            id="images"
                            name="images"
                            type="file"
                            onChange={(event) => {
                              formik.setFieldValue("images", event.target.files[0]);
                            }}
                            onBlur={formik.handleBlur}
                          />
                        </div>
                        {formik.touched.images && formik.errors.images ? (
                          <div className="text-red-500 text-sm">{formik.errors.images}</div>
                        ) : null}
                        <button
                          type="submit"
                          className="bg-[#82cd47] w-4/12 h-[30px] rounded-full px-3 text-white text-[16px] font-[600] shadow-md mt-4"
                          disabled={!formik.isValid || formik.isSubmitting}
                        >
                          {formik.isSubmitting ? "Uploading..." : "Upload Receipt"}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="object-fit-contain h-1/2 w-1/2 mx-auto">
                    <img src={success} alt="success" />
                  </div>
                )
            }
          </div>
          <div className="flex flex-row justify-center items-center w-full">
            <button
              className="bg-slate-300  w-6/12 h-[30px] mr-2 rounded-full px-3 text-[16px] font-[600] shadow-md "
              onClick={() => navigate(`/order-detail/${id}`)}>
              Back To Order Details
            </button>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default Payment;
