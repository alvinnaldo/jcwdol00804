import React, { useCallback, useEffect, useRef, useState } from "react";
import PageAdmin from "../../../Components/PageAdmin";
import { useSelector } from "react-redux";
import { FcShop } from "react-icons/fc";
import { IoSearchOutline } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { BsThreeDotsVertical, BsPlusLg } from "react-icons/bs";
import { AiFillCaretUp, AiFillCaretDown } from "react-icons/ai";
import { RiDeleteBinLine } from "react-icons/ri";
import { MdOutlineLibraryAdd } from "react-icons/md";
import { HiOutlineAdjustmentsVertical } from "react-icons/hi2";
import { AiOutlineEdit } from "react-icons/ai";
import Pagination from "../../../Components/Pagination";
import axios from "axios";
import { API_URL } from "../../../helper";
import { Link } from "react-router-dom";
import ModalDelete from "./ModalDelete";
import ModalAddStock from "./ModalAddStock";
import ModalStockAdjustment from "./ModalStockAdjustment";

const useClickOutside = (cbfn) => {
  let dom = useRef([]);
  useEffect(() => {
    let handler = (e) => {
      for (let idx in dom.current) {
        if (dom.current[idx] && !dom.current[idx].contains(e.target)) {
          cbfn();
        }
      }
    };
    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  });
  return dom;
};

const ManageProduct = () => {
  const { branch_name } = useSelector((state) => {
    return {
      branch_name: state.userReducer.branch_name,
    };
  });
  const searchRef = useRef("");
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortNameAsc, setSortNameAsc] = useState();
  const [sortPriceAsc, setSortPriceAsc] = useState();
  const [productList, setProductList] = useState([]);
  const [openDot, setOpenDot] = useState([]);
  const [countResult, setCountResult] = useState(0);
  const [limit, setLimit] = useState(1);
  const [modalDelete, setModalDelete] = useState(false);
  const [modalAddStock, setModalAddStock] = useState(false);
  const [modalStockAdjustment, setModalStockAdjustment] = useState(false);
  const token = localStorage.getItem("xmart_login");
  const [confirmDeleteItem, setConfirmDeleteItem] = useState({});
  const [addStockItem, setAddStockItem] = useState({});
  const [stockAdjustItem, setStockAdjustItem] = useState({});

  let refs = useClickOutside(() => {
    setTimeout(() => {
      setOpenDot(openDot.map((val) => false));
    }, [150]);
    // setOpenDot(openDot.map((val)=> false));
  });

  let handleOpenDot = (idx) => {
    setOpenDot(openDot.map((val2, idx2) => idx2 === idx && !val2));
  };

  const handleFeaturedProduct = (e, id) => {
    axios
      .patch(
        `${API_URL}/product/admin/set-featured-product/${id}`,
        { checked: e.target.checked },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => handleFetchProductList())
      .catch((err) => console.log(err));
  };

  const handleFetchProductList = useCallback(() => {
    axios
      .get(
        `${API_URL}/product/admin/product-list?search=${search}&page=${currentPage}&sort_by=${sortBy}&order=${
          sortBy === "name" ? sortNameAsc : sortPriceAsc
        }`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        setProductList(res.data.result);
        setLimit(res.data.limit);
        setCountResult(res.data.allResultLength);
      })
      .catch((err) => {
        console.log(err);
        setProductList([]);
        setCountResult(0);
      });
  }, [search, currentPage, token, sortBy, sortNameAsc, sortPriceAsc]);

  useEffect(() => {
    handleFetchProductList();
    // eslint-disable-next-line
  }, [search, currentPage, token, sortBy, sortNameAsc, sortPriceAsc]);

  useEffect(() => {
    setOpenDot(productList.map(() => false));
  }, [productList]);

  useEffect(() => {
    setSortNameAsc(true);
    setSortPriceAsc(true);
  }, [sortBy]);

  return (
    <PageAdmin>
      {/* If no product found */}
      {!productList.length && (
        <div className="absolute top-[40%] left-[55%] text-red-500">
          Product not found
        </div>
      )}
      {/* Table */}
      <div>
        <div className="items-start justify-between flex">
          <h3 className="text-gray-800 text-xl font-bold">
            <FcShop className="inline mb-1" size={25} /> {branch_name} Product
            List
          </h3>
          <div className="mt-3 md:mt-0">
            <Link
              to="/admin/add-product"
              className="inline-block px-4 py-2 text-white duration-150 font-medium bg-emerald-700 rounded-lg hover:bg-emerald-600 active:bg-emerald-700"
            >
              <BsPlusLg className="inline mb-1" /> Add product
            </Link>
          </div>
        </div>
        <div className="flex flex-row items-center mt-2">
          <div className="relative w-[40%] mr-3">
            <IoSearchOutline
              size={20}
              className="absolute top-[8px] left-2 text-slate-400"
            />
            <RxCross2
              size={20}
              className="absolute top-[9px] right-2 text-slate-400 cursor-pointer"
              onClick={() => {
                searchRef.current.value = "";
                setSearch("");
              }}
            />
            <input
              type="text"
              ref={searchRef}
              className="border w-full h-9 rounded-lg px-8 focus:border-emerald-500 focus:outline-none "
              placeholder="Search Product Name or Category"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-3 shadow-sm border rounded-lg overflow-visible">
          <table className="w-full table-auto text-sm text-left ">
            <thead className="bg-gray-100 text-gray-600 font-medium border-b">
              <tr>
                <th
                  onClick={() => {
                    setSortBy("name");
                    if (sortNameAsc === false) {
                      setSortBy("");
                    } else {
                      setSortNameAsc(!sortNameAsc);
                    }
                  }}
                  className="py-3 px-6 flex flex-row justify-between cursor-pointer hover:bg-gray-50"
                >
                  <span>Product</span>
                  <span className="relative">
                    <AiFillCaretUp
                      className={`absolute -top-[2px] ${
                        sortNameAsc &&
                        sortBy === "name" &&
                        "text-indigo-500 shadow-inner shadow-indigo-200 rounded-md"
                      }`}
                      size={14}
                    />
                    <AiFillCaretDown
                      className={`absolute -bottom-[3px] ${
                        !sortNameAsc &&
                        sortBy === "name" &&
                        "text-indigo-500 shadow-inner shadow-indigo-200 rounded-md"
                      }`}
                      size={14}
                    />
                  </span>
                </th>
                <th className="py-3 px-6">Category</th>
                <th
                  onClick={() => {
                    setSortBy("price");
                    if (sortPriceAsc === false) {
                      setSortBy("");
                    } else {
                      setSortPriceAsc(!sortPriceAsc);
                    }
                  }}
                  className="py-3 px-6 flex flex-row justify-between cursor-pointer hover:bg-gray-50"
                >
                  <span>Price</span>
                  <span className="relative">
                    <AiFillCaretUp
                      className={`absolute -top-[2px] ${
                        sortPriceAsc &&
                        sortBy === "price" &&
                        "text-indigo-500 shadow-inner shadow-indigo-200 rounded-md"
                      }`}
                      size={14}
                    />
                    <AiFillCaretDown
                      className={`absolute -bottom-[3px] ${
                        !sortPriceAsc &&
                        sortBy === "price" &&
                        "text-indigo-500 shadow-inner shadow-indigo-200 rounded-md"
                      }`}
                      size={14}
                    />
                  </span>
                </th>
                <th className="py-3 px-6 text-center">Stock</th>
                <th className="py-3 px-6 text-center">Weight</th>
                <th className="py-3 px-6 text-center">Featured</th>
                <th className="py-3 px-6"></th>
              </tr>
            </thead>
            <tbody className="text-gray-600 divide-y">
              {productList.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-100 duration-100">
                  <td className="flex items-center py-3 px-5">
                    <img
                      src={
                        item.product_img
                          ? `http://localhost:8000/${item.product_img}`
                          : "https://www.freeiconspng.com/thumbs/no-image-icon/no-image-icon-6.png"
                      }
                      alt={item.name}
                      className={`w-10 h-10 rounded-md mr-2 ${
                        item.product_img && "cursor-pointer"
                      }`}
                    />
                    <div className="text-gray-700 text-sm font-medium product-name">
                      {item.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.category_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    Rp {item.price.toLocaleString("id")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {item.stock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {item.weight} gr
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <input
                      type="checkbox"
                      checked={item.is_featured}
                      onChange={(e) => {
                        handleFeaturedProduct(e, item.id);
                      }}
                    />
                  </td>
                  <td className="text-right px-6 whitespace-nowrap relative">
                    <button
                      onClick={() => {
                        setConfirmDeleteItem({ name: item.name, id: item.id });
                        setModalDelete(!modalDelete);
                      }}
                      className="py-2 leading-none px-3 font-medium text-red-600 hover:text-red-500 duration-150 hover:bg-red-100 rounded-lg"
                    >
                      <RiDeleteBinLine size={17} />
                    </button>
                    <button
                      className="py-1 px-3 font-medium cursor-pointer rounded-lg"
                      onClick={() => handleOpenDot(idx)}
                    >
                      <BsThreeDotsVertical size={16} />
                    </button>
                    {openDot[idx] ? (
                      <div
                        className="flex flex-col absolute top-11 right-8 z-10 bg-white shadow-md"
                        ref={(element) => {
                          refs.current[idx] = element;
                        }}
                      >
                        <Link
                          to={`/admin/edit-product/${item.id}`}
                          className="py-2 hover:bg-indigo-100 cursor-pointer text-left px-3 duration-200"
                        >
                          <AiOutlineEdit className="inline mr-2" />
                          Edit Product
                        </Link>
                        <span
                          className="py-2 hover:bg-indigo-100 cursor-pointer text-left px-3 duration-200"
                          onClick={() => {
                            handleOpenDot(idx);
                            setModalAddStock(!modalAddStock);
                            setAddStockItem(item);
                          }}
                        >
                          <MdOutlineLibraryAdd className="inline mr-2" />
                          Add Stock
                        </span>
                        <span
                          className="py-2 hover:bg-indigo-100 cursor-pointer text-left px-3 duration-200"
                          onClick={() => {
                            handleOpenDot(idx);
                            setModalStockAdjustment(!modalStockAdjustment);
                            setStockAdjustItem(item);
                          }}
                        >
                          <HiOutlineAdjustmentsVertical className="inline mr-2" />
                          Stock Adjustment
                        </span>
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Pagination */}
      <div className="fixed bottom-9 right-5">
        <Pagination
          currentPage={currentPage}
          totalCount={countResult}
          pageSize={limit}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
      {modalDelete && (
        <ModalDelete
          setModalDelete={setModalDelete}
          modalDelete={modalDelete}
          confirmDeleteItem={confirmDeleteItem}
          handleFetchProductList={handleFetchProductList}
        />
      )}
      {modalAddStock && (
        <ModalAddStock
          setModalAddStock={setModalAddStock}
          modalAddStock={modalAddStock}
          addStockItem={addStockItem}
          handleFetchProductList={handleFetchProductList}
        />
      )}
      {modalStockAdjustment && (
        <ModalStockAdjustment
          setModalStockAdjustment={setModalStockAdjustment}
          modalStockAdjustment={modalStockAdjustment}
          stockAdjustItem={stockAdjustItem}
          handleFetchProductList={handleFetchProductList}
        />
      )}
    </PageAdmin>
  );
};

export default ManageProduct;
