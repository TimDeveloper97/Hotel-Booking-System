import mongoose from "mongoose";
import Discount from "../models/discount.js";
import UserUseDiscount from "../models/user_use_discount.js";
import Log from "../models/log.js";
import { STRING, INTEGER } from "../constants/constants.js";

const logAction = async (user, type, time) => {
  const newLog = new Log({
    user: user,
    type: type,
    target: "Mã khuyến mãi",
    time_stamp: time,
  });
  await newLog.save();
};

export const getAllDiscount = async (req, res) => {
  try {
    const discount = await Discount.find().sort({ created_date: -1 });
    setTimeout(() => {
      return res.status(200).json(discount);
    }, 1000);
  } catch (error) {
    console.log(error);
    res.status(500).send(STRING.UNEXPECTED_ERROR_MESSAGE);
  }
};

export const createDiscount = async (req, res) => {
  const discount = req.body;
  try {
    const TIME_STAMP = new Date();

    const existedDiscountCode = await Discount.findOne({ code: discount.code });

    if (existedDiscountCode)
      return res.status(403).send(STRING.DISCOUNT_CODE_ALREADY_EXIST);

    const newDiscount = new Discount({
      ...discount,
      quantity: Number(discount.quantity),
      value: Number(discount.value),
      pricing_condition: Number(discount.pricing_condition),
      created_date: TIME_STAMP,
    });
    await newDiscount.save();
    await logAction(req._id, INTEGER.LOG_ADD, TIME_STAMP);
    return res.status(200).json(newDiscount);
  } catch (error) {
    console.log(error);
    res.status(500).send(STRING.UNEXPECTED_ERROR_MESSAGE);
  }
};

export const updateDiscount = async (req, res) => {
  const { id } = req.params;
  const discount = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).send("No discount with that id");
  }
  try {
    const TIME_STAMP = new Date();
    const updatedDiscount = await Discount.findByIdAndUpdate(
      id,
      {
        ...discount,
        quantity: Number(discount.quantity),
        value: Number(discount.value),
        pricing_condition: Number(discount.pricing_condition),
        modified_date: TIME_STAMP,
      },
      { new: true }
    );
    await logAction(req._id, INTEGER.LOG_UPDATE, TIME_STAMP);
    res.status(202).json(updatedDiscount);
  } catch (error) {
    console.log(error);
    res.status(500).send(STRING.UNEXPECTED_ERROR_MESSAGE);
  }
};

export const deleteDiscount = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).send("No discount with that id");
  }
  try {
    const TIME_STAMP = new Date();
    await UserUseDiscount.deleteMany({ discount: id });
    await Discount.findOneAndRemove({ _id: id });
    await logAction(req._id, INTEGER.LOG_DELETE, TIME_STAMP);
    res.status(202).send("Discount deleted successfully");
  } catch (error) {
    console.log(error);
    res.status(500).send(STRING.UNEXPECTED_ERROR_MESSAGE);
  }
};

// CUSTOMER
export const checkDiscount = async (req, res) => {
  const data = req.body;
  try {
    const discount = await Discount.findOne({
      code: data.code,
    });
    // CHECK IF THE BOOKING MEETS THE DISCOUNT CONDITIONS
    if (!discount) return res.status(409).send("Mã khuyến mãi không tồn tại");
    if (discount.quantity === 0)
      return res.status(409).send("Mã khuyến mãi đã hết số lượng cho phép");
    if (discount.pricing_condition > data.amount)
      return res
        .status(409)
        .send("Đơn hàng không đủ điều kiện áp dụng mã khuyến mãi");

    // DISCOUNT OUTDATED
    const TIME_STAMP = new Date();
    const effective_from = new Date(discount.effective_from);
    const effective_to = new Date(discount.effective_to);

    if (TIME_STAMP < effective_from)
      return res
        .status(409)
        .send("Mã khuyến mãi không áp dụng tại thời gian này");
    if (TIME_STAMP > effective_to)
      return res.status(409).send("Mã khuyến mãi đã hết hạn");

    // CHECK IF USER ALREADY USED THE DISCOUNT
    const userUsedDiscount = await UserUseDiscount.findOne({
      user: req._id,
      discount: discount._id,
    });
    if (userUsedDiscount)
      return res
        .status(409)
        .send("Quý khách đã sử dụng mã khuyến mãi này trước đó");

    // PROCEED DISCOUNT
    res.status(202).json({
      _id: discount._id,
      value: discount.value,
      type: discount.type,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(STRING.UNEXPECTED_ERROR_MESSAGE);
  }
};