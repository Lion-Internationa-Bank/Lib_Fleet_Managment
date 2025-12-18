import Insurance from "../models/Insurance.js";
import catchAsync from "../utils/catchAsync.js";

export const createInsurance = catchAsync(async (req, res) => {
  const insurance = await Insurance.create(req.body);

  res.status(201).json({
    message: "Insurance record register successfully",
    success: true,
    data: insurance,
  });
});

export const getInsurances = catchAsync(async (req, res) => {
  const insurances = await Insurance.find().sort({ insurance_expired_date: -1 });

  res.status(200).json({
    success: true,
    count: insurances.length,
    data: insurances,
  });
});

export const updateInsurance = catchAsync(async (req, res) => {
  const insurance = await Insurance.findById(req.params.id);

  if (!insurance) {
    return res.status(404).json({
      success: false,
      message: "Insurance policy not found",
    });
  }

  Object.keys(req.body).forEach((key) => {
    insurance[key] = req.body[key];
  });

  await insurance.save();

  res.status(200).json({
    success: true,
    message:"Successfully update insurance recored",
    data: insurance,
  });
});