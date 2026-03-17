import React, { useEffect, useState, useRef } from "react";
import Page from "../../Components/Page";
import { IoSearchOutline } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { RiArrowDropDownLine, RiArrowDropUpLine } from "react-icons/ri";
import { BiReceipt } from "react-icons/bi";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import { DateRange } from "react-date-range";
import { subDays } from "date-fns";
import {
  TbSortAscending2,
  TbSortDescending2,
  TbSortAscendingNumbers,
  TbSortDescendingNumbers,
} from "react-icons/tb";
import Pagination from "../../Components/Pagination";
import { format } from "date-fns";
import axios from "axios";
import { API_URL } from "../../helper";
import { useNavigate } from "react-router-dom";

const OrderList = () => {
  const navigate = useNavigate();
  const [sortDateNewest, setSortDateNewest] = useState(true);
  const [sortInvAsc, setSortInvAsc] = useState(true);
  const [sortBy, setSortBy] = useState("created_at");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [countResult, setCountResult] = useState(0);
  const [limit, setLimit] = useState(1);
  const [openDate, setOpenDate] = useState(false);
  const [orderList, setOrderList] = useState([]);
  const token = localStorage.getItem("xmart_login");
  const searchRef = useRef("");

  const [dateRange, setDateRange] = useState([
    {
      startDate: subDays(new Date(), 31),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  useEffect(() => {
    axios
      .get(
        `${API_URL}/order/get-order-list?inv=${invoiceNo}&status=${status}&start_date=${format(
          dateRange[0].startDate,
          "yyyy-MM-dd"
        )}&end_date=${format(
          dateRange[0].endDate,
          "yyyy-MM-dd"
        )}&sort_by=${sortBy}&order=${
          sortBy === "invoice_no" ? sortInvAsc : sortDateNewest
        }&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        setOrderList(res.data.result);
        setLimit(res.data.limit);
        setCountResult(res.data.allResult.length);
      })
      .catch((err) => {
        console.log(err);
        setOrderList([]);
        setCountResult(0);
      });
  }, [
    sortDateNewest,
    sortInvAsc,
    invoiceNo,
    status,
    dateRange,
    token,
    sortBy,
    page,
  ]);

  return (
    <Page isFooter={false} navTitle="Order List">
      <div className="flex flex-col px-5">
        {/* Search Inv */}
        <div className="relative">
          <IoSearchOutline
            size={20}
            className="absolute top-[6px] left-2 text-slate-400"
          />
          <RxCross2
            size={20}
            className="absolute top-[6px] right-2 text-slate-400 cursor-pointer"
            onClick={() => {
              searchRef.current.value = "";
              setInvoiceNo("");
            }}
          />
          <input
            type="text"
            ref={searchRef}
            className="border w-full h-8 rounded-lg px-8 "
            placeholder="Order / Invoice No."
            onChange={(e) => setInvoiceNo(e.target.value)}
          />
        </div>
        {/* Select Status & Sorting */}
        <div className="flex flex-row mt-2 justify-between">
          <select
            className="w-[33%] border rounded-lg px-1 h-8 text-gray-900  focus:ring-[#6CC51D] focus:border-[#6CC51D] truncate"
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Semua Status</option>
            <option value="Menunggu Pembayaran">Menunggu Pembayaran</option>
            <option value="Menunggu Konfirmasi">
              Menunggu Konfirmasi Pembayaran
            </option>
            <option value="Diproses">Diproses</option>
            <option value="Dikirim">Dikirim</option>
            <option value="Dibatalkan">Dibatalkan</option>
            <option value="Selesai">Selesai</option>
          </select>
          <div
            className={
              sortBy === "created_at"
                ? "flex flex-row items-center ml-1 cursor-pointer border-2 rounded-full font-bold px-2 bg-gradient-to-tl from-lime-300 shadow-emerald-400/70 shadow-md border-emerald-400/60"
                : "flex flex-row items-center ml-1 cursor-pointer border rounded-full font-bold px-2 bg-gradient-to-tl from-lime-300"
            }
            onClick={() => {
              setSortBy("created_at");
              setSortDateNewest(!sortDateNewest);
            }}
          >
            {sortDateNewest ? (
              <>
                <TbSortAscending2 size={20} />
                <span className="text-sm ml-1 ">Newest to Oldest</span>
              </>
            ) : (
              <>
                <TbSortDescending2 size={20} />
                <span className="text-sm ml-1 ">Oldest to Newest</span>
              </>
            )}
          </div>
          <div
            className={
              sortBy === "invoice_no"
                ? "flex flex-row items-center ml-1 cursor-pointer border-2 rounded-full font-bold px-2 bg-gradient-to-tl from-lime-300 shadow-emerald-400/70 shadow-md border-emerald-400/60"
                : "flex flex-row items-center ml-1 cursor-pointer border rounded-full font-bold px-2 bg-gradient-to-tl from-lime-300 "
            }
            onClick={() => {
              setSortBy("invoice_no");
              setSortInvAsc(!sortInvAsc);
            }}
          >
            {sortInvAsc ? (
              <>
                <TbSortAscendingNumbers size={20} />
                <span className="text-sm ml-1 ">Invoice Asc</span>
              </>
            ) : (
              <>
                <TbSortDescendingNumbers size={20} />
                <span className="text-sm ml-1 ">Invoice Desc</span>
              </>
            )}
          </div>
        </div>
        {/* Date Range */}
        <div className="flex flex-col">
          <div
            className="border rounded-lg mt-2 px-2 w-[100%] h-8 flex items-center justify-center cursor-pointer"
            onClick={() => setOpenDate(!openDate)}
          >
            <span className="relative">
              {openDate ? (
                <RiArrowDropUpLine size={28} className="absolute -right-10 " />
              ) : (
                <RiArrowDropDownLine
                  size={28}
                  className="absolute -right-10 "
                />
              )}
              <span className="font-bold mr-2">From</span>
              {format(dateRange[0].startDate, " d MMM yyyy ")}
              <span className="font-bold ml-2 mr-2">To</span>
              {format(dateRange[0].endDate, " d MMM yyyy")}
            </span>
          </div>
          <div className="relative flex justify-center">
            {openDate && (
              <DateRange
                onChange={(item) => setDateRange([item.selection])}
                editableDateInputs={true}
                moveRangeOnFirstSelection={false}
                ranges={dateRange}
                months={2}
                direction="horizontal"
                className="absolute w-[100%] border shadow-md z-10"
                maxDate={new Date()}
              />
            )}
          </div>
        </div>
      </div>
      <div className="h-[6px] bg-slate-200 w-[100%] mt-4 mb-2 "></div>
      {/* Result */}
      <div className="flex flex-col px-5">
        {orderList.map((val, idx) => {
          return (
            <div
              key={idx}
              onClick={() => navigate(`/order-detail/${val.id}`)}
              className="container rounded-xl shadow-md border h-min-[200px] w-[440px] py-2 mt-2 mb-2"
            >
              <div className="flex flex-row items-center justify-between px-3">
                <div className="flex flex-row items-center">
                  <BiReceipt size={30} />
                  <div className="flex flex-col ml-2 ">
                    <span className="text-xs font-bold text-slate-400">
                      {val.invoice_no}
                    </span>
                    <span className="text-sm font-bold text-[#6cc51d]">
                      {format(new Date(val.created_at), "d MMM yyyy")}
                    </span>
                  </div>
                </div>
                <div
                  className={
                    ["Menunggu Pembayaran", "Dibatalkan"].includes(val.status)
                      ? "text-center text-xs bg-red-300 bg-opacity-40 text-red-500 p-2 m-3 rounded-lg font-semibold"
                      : "text-center text-xs bg-lime-300 bg-opacity-40 text-[#6CC51D] p-1 m-3 rounded-lg font-semibold"
                  }
                >
                  {val.status}
                </div>
              </div>
              <div className="h-[1px] bg-slate-200 w-[95%] mt-1 ml-3"></div>
              <div className="text-base font-bold px-3 pt-2">
                {val.branch_name}
              </div>
              <div className="flex flex-row px-3 items-center">
                <img
                  src={`http://localhost:8000/${val.product_img}`}
                  alt=""
                  className=" w-12 h-12 mt-2 border text-xs"
                />
                <div className="flex flex-col ml-2 mt-1 truncate">
                  <div className="text-sm font-bold w-[100%] truncate">
                    {val.name}
                  </div>
                  <span className="text-slate-400 text-xs font-semibold">
                    {val.quantity} {val.quantity > 1 ? "items" : "item"}
                  </span>
                </div>
              </div>
              {val.total_items === 1 ? null : (
                <div className="px-3 text-slate-400 text-xs font-semibold mt-1">
                  +{val.total_items - 1} produk lainnya
                </div>
              )}
              <div className="px-3 mt-1 text-center">
                <span className="font-bold">Total Purchase : </span>
                <span className="font-bold text-[#6CC51D]">
                  Rp {Number(val.total_purchased).toLocaleString("id")}
                </span>
              </div>
            </div>
          );
        })}
        {/* Pagination */}
        <div className="self-center relative bottom-0 mt-8 mb-10 ">
          <Pagination
            currentPage={page}
            totalCount={countResult}
            pageSize={limit}
            onPageChange={(page) => setPage(page)}
          />
        </div>
        {/* If order not found */}
        {!orderList.length && (
          <div className="absolute top-[40%] left-[46%] text-red-500">
            Order not found
          </div>
        )}
      </div>
    </Page>
  );
};

export default OrderList;
