import type { Request, Response } from "express";

import { ApiResponse } from "../../../core/response/ApiResponse.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { adminUserService } from "../service/admin-user.service.js";

type UserParams = {
  id?: string;
};

export const listUsers = asyncHandler(async (_req, res) => {
  const users = await adminUserService.listUsers();

  return ApiResponse.success(res, {
    statusCode: 200,
    message: "Users retrieved successfully.",
    data: users,
  });
});

export const getUser = asyncHandler(async (req, res) => {
  const id = req.params.id;

  if (typeof id !== "string") {
    throw new Error("Invalid user ID");
  }

  const user = await adminUserService.getUser(id);

  return ApiResponse.success(res, {
    statusCode: 200,
    message: "User retrieved successfully.",
    data: user,
  });
});

export const updateUser = asyncHandler(async (req: Request, res) => {
  const id = req.params.id;

  if (typeof id !== "string") {
    throw new Error("Invalid user ID");
  }

  const user = await adminUserService.updateUser(id, req.body);

  return ApiResponse.success(res, {
    statusCode: 200,
    message: "User updated successfully.",
    data: user,
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const id = req.params.id;

  if (typeof id !== "string") {
    throw new Error("Invalid user ID");
  }

  await adminUserService.deleteUser(id);

  return ApiResponse.success(res, {
    statusCode: 200,
    message: "User deleted successfully.",
    data: null,
  });
});
