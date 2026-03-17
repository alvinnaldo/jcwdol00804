import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../../helper";
import { AiFillPlusCircle } from "react-icons/ai";
import { FcShop } from "react-icons/fc";
import {
  TbSortAscendingLetters,
  TbSortDescendingLetters,
  TbSortDescendingNumbers,
  TbSortAscendingNumbers,
} from "react-icons/tb";
// import img from "../../../Assets/default.png";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { changeStoreAction, setDefaultStore } from "../../../Actions/store";
import toast, { Toaster } from "react-hot-toast";
import notFound from "../../../Assets/not-found.png";
import Pagination from "../../../Components/Pagination";

const ProductComponent = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { branchName, isLogged, is_verified } = useSelector((state) => {
    return {
      branchName: state.storeReducer.defaultStore,
      isLogged: state.userReducer.id,
      is_verified: state.userReducer.is_verified,
    };
  });
  const [products, setProducts] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [category, setCategory] = useState(
    location.state ? location.state.from : ""
  );
  const [name, setName] = useState("");
  const [by, setBy] = useState("name");
  const [order, setOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(1);
  const [countResult, setCountResult] = useState(0);
  const [isModal, setIsModal] = useState(false);
  const [modalProductId, setModalProductId] = useState();
  const [branchList, setBranchList] = useState([]);

  const getProducts = async () => {
    try {
      if (!branchName) {
        const selectedBranch = sessionStorage.getItem("branchName");
        const { data } = await axios.get(
          `${API_URL}/product/product-list?category=${category}&name=${name}&by=${by}&order=${order}&page=${page}&branch_name=${selectedBranch}`
        );
        setProducts(data.data);
        setCountResult(data.allResultLength);
        setLimit(data.limit);
      } else {
        const { data } = await axios.get(
          `${API_URL}/product/product-list?category=${category}&name=${name}&by=${by}&order=${order}&page=${page}&branch_name=${branchName}`
        );
        setProducts(data.data);
        setCountResult(data.allResultLength);
        setLimit(data.limit);
      }
    } catch (error) {
      console.log(error.response);
      setProducts([]);
      setCountResult(0);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(
        `${API_URL}/category/categories?branch_name=${branchName}`
      );
      setCategoryList(data.data);
    } catch (error) {
      setCategoryList([]);
    }
  };

  useEffect(() => {
    axios.get(`${API_URL}/product/get-branch-list`).then((res) => {
      setBranchList(res.data);
    });
    fetchCategories();
    getProducts();
    if (!branchName) {
      const selectedBranch = sessionStorage.getItem("branchName");
      if (selectedBranch) {
        dispatch(changeStoreAction({ defaultStore: selectedBranch }));
      } else {
        // If no branchName is selected, set the default store
        dispatch(setDefaultStore());
      }
    } else {
      // If branchName is set in the state, store it in session storage
      sessionStorage.setItem("branchName", branchName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, name, by, order, limit, page, branchName, dispatch]);

  const handleSortByName = () => {
    if (by === "name") {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setBy("name");
      setOrder("asc");
    }
  };

  const handleSortByPrice = () => {
    if (by === "price") {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setBy("price");
      setOrder("asc");
    }
  };

  const handleCategoryChange = (e) => {
    const selected = e.target.value;
    if (selected === "Select category") {
      setCategory("");
    } else {
      setCategory(selected);
    }
    setPage(1);
  };

  // Add to cart
  const handleAddToCart = (product_id, branch_name) => {
    const token = localStorage.getItem("xmart_login");
    if (!is_verified) {
      toast.error("Please verify your account first");
    } else {
      axios
        .post(
          `${API_URL}/cart/add-to-cart`,
          {
            quantity: 1,
            product_id,
            branch_name,
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
            setModalProductId(product_id);
          } else {
            toast.success(res.data.message);
          }
        })
        .catch((err) => console.log(err));
    }
  };

  const handleRemoveCartItem = (product_id) => {
    const token = localStorage.getItem("xmart_login");
    axios
      .patch(
        `${API_URL}/cart/replace-cart`,
        {
          quantity: 1,
          product_id,
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
    <div className="container">
      <Toaster />
      {/* Modal Section */}
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
                      handleRemoveCartItem(modalProductId);
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
      <div className="px-5 flex flex-row items-center mb-3">
        <FcShop size={20} />
        <select
          className="bg-[#6CC51D] font-semibold text-white rounded-full px-3 ml-1 cursor-pointer"
          value={branchName}
          onChange={(e) =>
            dispatch(changeStoreAction({ defaultStore: e.target.value }))
          }
        >
          {branchList.map((val, idx) => {
            return (
              <option key={idx} value={val.name}>
                {val.name}
              </option>
            );
          })}
        </select>
      </div>
      <div className="flex flex-col justify-center px-14">
        {/* Filter by name */}
        <div className="flex items-center bg-gray-100 rounded px-2 w-full h-8">
          <input
            className="bg-transparent text-sm p-1 pl-1 w-full focus:outline-none"
            placeholder="Search name.."
            type="text"
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
        </div>
        {/* Sorting */}
        <div className="flex justify-between mt-2 mb-5">
          <select
            className="bg-gray-100 rounded w-40 text-sm text-gray-400 h-8 px-2 focus:outline-none"
            value={category}
            onChange={handleCategoryChange}
          >
            <option value="Select category">Select category</option>
            {categoryList.map((category) => {
              return (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              );
            })}
          </select>
          {/* Button ASC/DESC by name */}
          <button
            className="flex bg-white rounded-md shadow-md text-sm text-[gray] hover:text-[#82CD47] my-[2px] p-1"
            onClick={handleSortByName}
          >
            Sort by name
            {by === "name" && order === "asc" && (
              <TbSortAscendingLetters size={16} className="mt-1 ml-1" />
            )}
            {by === "name" && order === "desc" && (
              <TbSortDescendingLetters size={16} className="mt-1 ml-1" />
            )}
          </button>
          {/* Button ASC/DESC by price */}
          <button
            className="flex bg-white rounded-md shadow-md text-sm text-[gray] hover:text-[#82CD47] my-[2px] p-1"
            onClick={handleSortByPrice}
          >
            Sort by price
            {by === "price" && order === "asc" && (
              <TbSortAscendingNumbers size={16} className="mt-1 ml-1" />
            )}
            {by === "price" && order === "desc" && (
              <TbSortDescendingNumbers size={16} className="mt-1 ml-1" />
            )}
          </button>
        </div>
      </div>
      {/* Products Result */}
      {products.length === 0 ? (
        <div className="flex flex-row flex-wrap justify-center">
          <img className="w-40 h-40" src={notFound} alt="not-found" />
        </div>
      ) : (
        <div className="flex flex-row flex-wrap justify-center">
          {products.map((product) => (
            <div key={product.id}>
              <div
                className="flex-col justify-center box-content 
                            rounded-lg drop-shadow-md h-42 w-32 bg-white
                            text-xs mx-5 my-2 pt-2
                            hover:border border-[#86C649]"
              >
                <Link to={`/product-detail/${product.id}`}>
                  <img className="h-20 w-20 mx-auto mt-1" src={`http://localhost:8000/${product.product_img}`} alt="img" />
                  <div className="text-center text-sm font-medium product-name h-10">
                    {product.name}
                  </div>
                  <div
                    className="text-center text-sm text-[#86C649] 
                            font-semibold my-1"
                  >
                    Rp. {product.price.toLocaleString("id")},-
                  </div>
                </Link>
                {/* Button Add to cart */}
                <div className="flex justify-end">
                  <button
                    className={
                      isLogged
                        ? "text-[#82CD47] hover:text-[#BFF099]"
                        : "text-gray-200"
                    }
                    onClick={() =>
                      handleAddToCart(product.id, product.branch_id)
                    }
                    disabled={!isLogged}
                  >
                    <AiFillPlusCircle size={30} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Pagination */}
      <div className="flex justify-center my-10 font-semibold">
        <Pagination
          currentPage={page}
          totalCount={countResult}
          pageSize={limit}
          onPageChange={(page) => setPage(page)}
        />
      </div>
    </div>
  );
};

export default ProductComponent;
