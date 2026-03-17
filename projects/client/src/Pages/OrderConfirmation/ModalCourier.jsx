import React from "react";

const ModalCourier = ({
  isModalCourier,
  modalOpener,
  courierList,
  setCourier,
}) => {
  return (
    <>
      {isModalCourier && (
        <div className="container flex justify-center mx-auto">
          <div className="fixed inset-0 flex items-start pt-[10%] justify-center bg-gray-700 bg-opacity-50 z-10">
            <div className="max-w-sm  p-6 bg-white divide-y divide-gray-500 w-[80%] h-[80%] overflow-y-scroll">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl">Select Courier</h3>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  cursor="pointer"
                  onClick={() => modalOpener(!isModalCourier)}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex flex-col mt-1">
                <div className="text-xs">
                  *ETA = estimated time arrived (in days)
                </div>
                {courierList.length ? (
                  courierList.map((val, idx) => {
                    return (
                      <div
                        key={idx}
                        className="shadow-md w-full text-center pt-3 pb-5 rounded-lg mt-4 border"
                      >
                        <div className="font-bold">{val.name}</div>
                        <div className="h-[1px] bg-slate-200 w-[95%] mt-1 ml-3"></div>
                        <div className="flex flex-col items-center mt-2">
                        <div
                                className="border w-[90%] rounded-full mt-3 py-1 hover:bg-emerald-100/[.5] cursor-pointer px-3"
                                onClick={() => {
                                  setCourier(val);
                                  modalOpener(!isModalCourier);
                                }}>
                                {val.service} - Rp{" "}
                                {val.cost.toLocaleString("id")} (ETA :{" "}
                                {val.etd})
                        </div>
                          {/* {val.costs.map((val2, idx2) => {
                            return (
                              <div
                                key={idx2}
                                className="border w-[90%] rounded-full mt-3 py-1 hover:bg-emerald-100/[.5] cursor-pointer px-3"
                                onClick={() => {
                                  setCourier({ ...val2, name: val.name });
                                  modalOpener(!isModalCourier);
                                }}
                              >
                                {val2.service} - Rp{" "}
                                {val2.cost[0].value.toLocaleString("id")} (ETA :{" "}
                                {val2.cost[0].etd})
                              </div>
                            );
                          })} */}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  // Spinner
                  <svg
                    className="w-10 h-10 mx-auto mt-10 animate-spin inline text-emerald-200"
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
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ModalCourier;
