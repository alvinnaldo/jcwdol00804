export const changeStoreAction = (data) => {
  return {
    type: "CHANGE_STORE",
    payload: data,
  };
};

export const setDefaultStore = () => {
  return {
    type: "SET_DEFAULT",
    payload: { defaultStore: "Xmart SCBD" },
  };
};
