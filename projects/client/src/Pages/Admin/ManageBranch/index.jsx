import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { API_URL } from "../../../helper";
import PageAdmin from "../../../Components/PageAdmin";
import {
    MdKeyboardArrowDown,
    MdKeyboardArrowLeft,
    MdKeyboardArrowRight,
} from "react-icons/md";
import { IoSearchOutline } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { GiQueenCrown } from "react-icons/gi";
import { Link } from "react-router-dom";
import { BsPlusLg } from "react-icons/bs";

const ManageBranch = () => {
    const [admin, setAdmin] = useState([]);
    const [branchList, setBranchList] = useState([]);
    const [nameValue, setNameValue] = useState("");
    const nameRef = useRef("");
    const [branchValue, setBranchValue] = useState("");
    const [orderBy, setOrderBy] = useState("u.id");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(0);

    const getDataAdmin = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/user/get-branch-admin?order_by=${orderBy}&page=${page}&name=${nameValue}&branch=${branchValue}`);
            setAdmin(data.data);
            setLimit(data.limit);
        } catch (error) {
            alert(error.response.data.message);
        }
    };

    useEffect(() => {
        getDataAdmin();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderBy, page, nameValue, branchValue]);

    useEffect(() => {
        axios.get(`${API_URL}/product/get-branch-list`).then((res) => {
            setBranchList(res.data);
        });
    }, []);

    const handleSortById = () => {
        setOrderBy("u.id");
        getDataAdmin();
    };

    const handleSortByName = () => {
        setOrderBy("u.name");
        getDataAdmin();
    };

    const handleSortByBranchName = () => {
        setOrderBy("b.name");
        getDataAdmin();
    };

    const handleNextPage = () => {
        setPage(page + 1);
    };

    const handlePrevPage = () => {
        setPage(page - 1);
    };

    const handleBranchNameChange = (e) => {
        const selected = e.target.value;
        if (selected === "All Branch") {
            setBranchValue("");
        } else {
            setBranchValue(selected);
        }
    };

    return (
        <PageAdmin>
            <div className="items-start justify-between flex">
                <h3 className="text-gray-800 text-xl font-bold">
                    <GiQueenCrown className="inline mb-1" size={25} /> Manage Branch Admin
                </h3>
                <div className="mt-3 md:mt-0">
                    <Link
                        to="/admin/add-branch-admin"
                        className="inline-block px-4 py-2 text-white duration-150 font-medium bg-emerald-700 rounded-lg hover:bg-emerald-600 active:bg-emerald-700"
                    >
                        <BsPlusLg className="inline mb-1" /> Add Branch Admin
                    </Link>
                </div>
            </div>
            <div className="flex flex-col justify-between mb-2 mt-5">
                <div className="relative w-[40%] mb-2">
                    <IoSearchOutline
                        size={20}
                        className="absolute top-[8px] left-2 text-slate-400"
                    />
                    <RxCross2
                        size={20}
                        className="absolute top-[6px] right-2 text-slate-400 cursor-pointer"
                        onClick={() => {
                            nameRef.current.value = "";
                            setNameValue("");
                        }}
                    />
                    <input
                        type="text"
                        ref={nameRef}
                        className="border w-full h-8 rounded-lg px-8 "
                        placeholder="Username"
                        onChange={(e) => setNameValue(e.target.value)}
                    />
                </div>
                <select
                    className="w-[20%] border rounded-lg px-1 h-8 focus:ring-black focus:border-black truncate mr-5"
                    value={branchValue}
                    onChange={handleBranchNameChange}
                >
                    <option value="All Branch" className="text-slate-400">All Branch</option>
                    {branchList.map((branchList) => {
                        return (
                            <option key={branchList.id} value={branchList.name}>
                                {branchList.name}
                            </option>
                        );
                    })}
                </select>
            </div>
            <div className="h-[6px] bg-slate-200 w-full mt-5 mb-2"></div>
            <div className="mt-2 shadow-sm border rounded-lg overflow-visible">
                <table className="w-full table-auto text-sm text-left ">
                    <thead className="bg-gray-100 text-gray-600 font-medium border-b">
                        <tr>
                            <th className="py-3 pl-6">
                                ID
                            </th>
                            <th>
                                <MdKeyboardArrowDown className="my-auto" size={20} onClick={handleSortById} cursor="pointer" />
                            </th>
                            <th className="py-3 px-6">
                                Name
                            </th>
                            <th className="py-3">
                                <MdKeyboardArrowDown className="my-auto" size={20} onClick={handleSortByName} cursor="pointer"/>
                            </th>
                            <th className="py-3 px-6">Phone</th>
                            <th className="py-3 px-6">Email</th>
                            <th className="py-3 px-6">
                                Branch Name
                            </th>
                            <th className="py-3">
                                <MdKeyboardArrowDown className="mt-1" size={20} onClick={handleSortByBranchName} cursor="pointer" />
                            </th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 divide-y">
                        {admin.map((value) => {
                            return (
                                <tr key={value.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {value.id}
                                    </td>
                                    <td></td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {value.name}
                                    </td>
                                    <td></td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {value.phone}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {value.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {value.branch_id}
                                    </td>
                                    <td></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-center">
                <div className="self-center mt-8 mb-10 flex flex-row items-center">
                    <button
                        className="mx-10"
                        onClick={handlePrevPage}
                        disabled={page <= 1}
                    >
                        <MdKeyboardArrowLeft size={25} />
                    </button>
                    <div className="mx-2">
                        Page {page}
                    </div>
                    <button
                        className="mx-10"
                        onClick={handleNextPage}
                        disabled={admin.length < limit}
                    >
                        <MdKeyboardArrowRight size={25} />
                    </button>
                </div>
            </div>
        </PageAdmin >
    );
};

export default ManageBranch;
