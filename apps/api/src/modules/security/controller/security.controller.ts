import { ApiResponse } from "../../../core/response/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { securityEventService } from "../services/security-event.service.js";

export const getSecurityEvents = asyncHandler(async (req, res) => {
  const events = await securityEventService.getUserEvents(req.user!.id);

  return ApiResponse.success(res, {
    statusCode: 200,
    message: "Security events retrieved successfully.",
    data: events,
  });
});
