import { ApiResponse } from "../../../core/response/ApiResponse.js";

import { asyncHandler } from "../../../utils/asyncHandler.js";

import { adminUserService } from "../service/admin-user.service.js";

export const listUsers = asyncHandler(async (req, res) => {
  if (!req.application) {
    throw new Error("Application context is required");
  }

  const users = await adminUserService.listUsers(req.application._id);

  return ApiResponse.success(res, {
    statusCode: 200,
    message: "Users retrieved successfully.",
    data: users,
  });
});

export const getUser = asyncHandler(async (req, res) => {
  if (!req.application) {
    throw new Error("Application context is required");
  }

  const id = req.params.id;

  if (typeof id !== "string") {
    throw new Error("Invalid user ID");
  }

  const user = await adminUserService.getUser(req.application._id, id);

  return ApiResponse.success(res, {
    statusCode: 200,
    message: "User retrieved successfully.",
    data: user,
  });
});

export const updateUser = asyncHandler(async (req, res) => {
  if (!req.application) {
    throw new Error("Application context is required");
  }

  const id = req.params.id;

  if (typeof id !== "string") {
    throw new Error("Invalid user ID");
  }

  const body = req.body as {
    firstName?: string;
    lastName?: string;
    role?: string;
    status?: string;
  };

  const user = await adminUserService.updateUser(req.application._id, id, body);

  return ApiResponse.success(res, {
    statusCode: 200,
    message: "User updated successfully.",
    data: user,
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  if (!req.application) {
    throw new Error("Application context is required");
  }

  const id = req.params.id;

  if (typeof id !== "string") {
    throw new Error("Invalid user ID");
  }

  await adminUserService.deleteUser(req.application._id, id);

  return ApiResponse.success(res, {
    statusCode: 200,
    message: "User deleted successfully.",
    data: null,
  });
});
