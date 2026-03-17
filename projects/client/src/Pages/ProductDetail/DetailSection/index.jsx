import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../../helper";
import { AiFillPlusCircle, AiFillMinusCircle } from "react-icons/ai";
import { BiCartAlt } from "react-icons/bi";
// import img from "../../../Assets/default.png";
import toast, { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";

const DetailSection = () => {
  const { id } = useParams();
  const { isLogged, is_verified } = useSelector((state) => {
    return {
      isLogged: state.userReducer.id,
      is_verified: state.userReducer.is_verified,
    };
  });

  // Fetching Data from API
  const [detail, setDetail] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isModal, setIsModal] = useState(false);

  // Get Data from API
  const getDetail = async () => {
    try {
      const result = await axios.get(`${API_URL}/product/detail/${id}`);
      setDetail(result.data.data);
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  useEffect(() => {
    getDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPlus = () => {
    if (quantity < detail?.stock) {
      setQuantity(quantity + 1);
    }
  };

  const onMinus = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    const token = localStorage.getItem("xmart_login");
    if (!is_verified) {
      toast.error("Please verify your account first");
    } else {
      axios
        .post(
          `${API_URL}/cart/add-to-cart`,
          {
            quantity,
            product_id: id,
            branch_name: detail.branch_id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((res) => {
          if (res.status === 202) {
            setIsModal(!isModal);
          } else {
            toast.success(res.data.message);
          }
        })
        .catch((err) => console.log(err));
    }
  };

  const handleRemoveCartItem = () => {
    const token = localStorage.getItem("xmart_login");
    axios
      .patch(
        `${API_URL}/cart/replace-cart`,
        {
          quantity,
          product_id: id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => toast.success(res.data.message))
      .catch((err) => console.log(err));
  };

  return (
    <div className="flex flex-col justify-center mx-16">
      <Toaster />
      {isModal && (
        <div className="container flex justify-center mx-auto">
          <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50 z-10">
            <div className="max-w-sm  p-6 bg-white divide-y divide-gray-500">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl">Remove cart confirmation</h3>
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
                <p className="text-lg mt-4 font-bold text-red-500">
                  Warning ! Different Store Location
                </p>
                <p className="mb-4 text-sm mt-2">
                  Adding this product to your cart will remove{" "}
                  <span className="font-bold">all previous items</span> from
                  your cart. Are you sure you want to continue?{" "}
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
                      handleRemoveCartItem();
                      setIsModal(!isModal);
                    }}
                  >
                    Yes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Image */}
      <div>
        <img className="" src={`http://localhost:8000/${detail.product_img}`} alt="img" />
      </div>
      {/* Name & Add Items */}
      <div className="flex justify-between">
        <div className="text-3xl font-bold text-gray-900">{detail.name}</div>
        <div className="flex items-center pt-2">
          <button
            onClick={onMinus}
            className={isLogged? "text-[#82CD47] hover:text-[#BFF099]": "text-gray-200"}
            disabled={!isLogged}
          >
            <AiFillMinusCircle size={25} />
          </button>
          <div className="font-semibold text-xl mx-5">{quantity}</div>
          <button
            onClick={onPlus}
            className={isLogged? "text-[#82CD47] hover:text-[#BFF099]": "text-gray-200"}
            disabled={!isLogged}
          >
            <AiFillPlusCircle size={25} />
          </button>
        </div>
      </div>
      {/* Category */}
      <div className="text-base font-semibold my-2">{detail.category_id}</div>
      {/* Price */}
      <div className="flex my-2">
        <div className="flex">
          <div className="text-2xl text-[#86C649] font-semibold">
            Rp. {detail.price?.toLocaleString("id")},-
          </div>
        </div>
      </div>
      {/* Description */}
      <div className="font-semibold my-2">Descriptions</div>
      <div className="text-gray-400 text-justify">{detail.description}</div>
      {/* Button */}
      <div className="flex justify-center my-10">
        <button
          className={
            isLogged
              ? "flex justify-around items-center rounded-md bg-white w-44 h-8 text-[#86C649] text-[22px] font-[600] shadow-md px-2 hover:bg-[#82CD47] hover:text-white cursor-pointer"
              : "flex justify-around items-center rounded-md bg-gray-200 w-44 h-8 text-gray-400 text-[22px] font-[600] shadow-md px-2 "
          }
          disabled={!isLogged}
          onClick={handleAddToCart}
        >
          <BiCartAlt size={25} />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default DetailSection;
