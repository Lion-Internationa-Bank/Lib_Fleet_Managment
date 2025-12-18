import MaintenanceAgreement from '../models/MaintenanceAgreement.js';
import catchAsync from '../utils/catchAsync.js';

const ITEMS_PER_PAGE = 20;

// Helper to get agreements with pagination & basic filters
const getFilteredAgreements = async (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || ITEMS_PER_PAGE;
  const skip = (page - 1) * limit;

  let filters = {};
  if (query.service_provider) {
    filters.service_provider = new RegExp(query.service_provider, 'i');
  }

  const agreements = await MaintenanceAgreement.find(filters)
    .sort({ contract_expiry_date: -1 })
    .skip(skip)
    .limit(limit);

  const total = await MaintenanceAgreement.countDocuments(filters);
  const totalPages = Math.ceil(total / limit);

  return {
    agreements,
    pagination: {
      page,
      limit,
      totalPages,
      total,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

export const createAgreement = catchAsync(async (req, res) => {
  const agreement = await MaintenanceAgreement.create(req.body);

  res.status(201).json({
    message:"Maintenance agreement successfuly registered",
    success: true,
    data: agreement,
  });
});

export const getAgreements = catchAsync(async (req, res) => {
  const { agreements, pagination } = await getFilteredAgreements(req.query);

  res.status(200).json({
    success: true,
    count: agreements.length,
    total: pagination.total,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      totalPages: pagination.totalPages,
      hasNext: pagination.hasNext,
      hasPrev: pagination.hasPrev,
    },
    data: agreements,
  });
});

export const updateAgreement = catchAsync(async (req, res) => {
  const agreement = await MaintenanceAgreement.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!agreement) {
    return res.status(404).json({
      success: false,
      message: 'Maintenance agreement not found',
    });
  }

  res.status(200).json({
    message:"Maintenance agreement sucessfuly updated",
    success: true,
    data: agreement,
  });
});
