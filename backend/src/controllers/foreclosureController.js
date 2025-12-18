// backend/src/controllers/foreclosureController.js
import ForeclosureVehicle from '../models/ForeclosureVehicle.js';

// Helper: Not Found
const sendNotFound = (res, plateNo) =>
  res.status(404).json({
    success: false,
    message: `Forclosure Vehicle with plate number '${plateNo}' not found`,
  });

export const createForeclosure = async (req, res,next) => {
  try {
    const foreclosure = await ForeclosureVehicle.create(req.body);
    res.status(201).json({
      success: true,
      data: foreclosure,
    });
  } catch (error) {
      next(error);
  }
};


// GET /api/v1/foreclosures?plate_no=ET-12345&property_owner=John&date_into=2025-01-01&page=1&limit=15&sort=-date_into
export const getForeclosuresVehilces = async (req, res,next) => {
  try {
    const {
      plate_no,
      property_owner,
      lender_branch,
      parking_place,
      date_into,     // filter by entry date (from)
      date_out,      // filter if exited
      status,        // custom: 'active' or 'closed'
      page = 1,
      limit = 10,
      sort = '-date_into',
    } = req.query;

    const filter = {};

    if (plate_no) filter.plate_no = { $regex: plate_no, $options: 'i' };
    if (property_owner) filter.property_owner = { $regex: property_owner, $options: 'i' };
    if (lender_branch) filter.lender_branch = { $regex: lender_branch, $options: 'i' };
    if (parking_place) filter.parking_place = { $regex: parking_place, $options: 'i' };

    if (date_into) {
      filter.date_into = { $gte: new Date(date_into) };
    }

    if (date_out) {
      filter.date_out = { $lte: new Date(date_out) };
    }

    // Custom status filter: active = no date_out, closed = has date_out
    if (status === 'active') filter.date_out = null;
    if (status === 'closed') filter.date_out = { $ne: null };

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Sort
    let sortObj = {};
    const sortFields = sort.split(',');
    sortFields.forEach(field => {
      const order = field.startsWith('-') ? -1 : 1;
      const key = field.startsWith('-') ? field.slice(1) : field;
      sortObj[key] = order;
    });

    const total = await ForeclosureVehicle.countDocuments(filter);
    const foreclosures = await ForeclosureVehicle.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      count: foreclosures.length,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
      data: foreclosures,
    });
  } catch (error) {
    next(error);
  }
};

export const updateForeclosure = async (req, res,next) => {
  try {

   const plate_No = req.params.plateNo

    const foreclosure = await ForeclosureVehicle.findOneAndUpdate(
     {plate_no: plate_No.toUpperCase()},
      req.body,
      { new: true, runValidators: true }
    );

   if (!foreclosure) return sendNotFound(res, plate_No);

    res.status(200).json({
      success: true,
      message: `Foreclosure vehicle updated successfully.`,
      data: foreclosure,
    });
  } catch (error) {
   next(error);
  }
};


export const updateForeclosureDateOut = async (req, res, next) => {
    try {
     
        // const { plate_no } = req.params;
        const plate_no = req.params.plateNo;
        const { date_out } = req.body;

        console.log("plate no",plate_no)
         console.log("date out",date_out)

        // Validation: Ensure date_out is provided and is a valid date
        if (!date_out || isNaN(new Date(date_out))) {
            return res.status(400).json({ success: false, message: 'A valid date_out field is required in the request body.' });
        }

        const updatedForeclosure = await ForeclosureVehicle.findOneAndUpdate(
            {plate_no: plate_no.toUpperCase()},
            { date_out: date_out }, // <-- Only update this specific field
            { new: true }
        );

        if (!updatedForeclosure) return sendNotFound(res, plate_no);

        res.status(200).json({
            success: true,
            message: `Foreclosure vehicle with Plate No. ${plate_no} marked as exited on ${new Date(date_out).toLocaleDateString()}.`,
            data: updatedForeclosure,
        });
    } catch (error) {
      next(error);
    }
};