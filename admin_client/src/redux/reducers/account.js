import { STRING } from "../../constants";

export default (state = [], action) => {
  switch (action.type) {
    case STRING.GET_ALL_ACCOUNT:
      return action.payload;
    case STRING.UPDATE_ACCOUNT:
      return state.map((account) =>
        account._id !== action.payload._id ? account : action.payload
      );
    default:
      return state;
  }
};
