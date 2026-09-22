import request from "supertest";
import { Types } from "mongoose";
import { describe, expect, it } from "vitest";

import app from "../../helpers/app.js";

import { User } from "../../../modules/auth/model/user.model.js";

import {
  authenticatedRequest,
  loginAsAdmin,
  loginAsVerifiedUser,
} from "../../helpers/login.helper.js";
import { createVerifiedUserInApplication } from "../../helpers/user.factory.js";

describe("Admin User Management", () => {
  it("should allow an admin to access the user list", async () => {
    const admin = await loginAsAdmin();

    const response = await authenticatedRequest(
      admin.accessToken,
      admin.clientId,
    ).get("/api/v1/admin/users");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("should reject a normal user from accessing admin users", async () => {
    const user = await loginAsVerifiedUser();

    const response = await authenticatedRequest(
      user.accessToken,
      user.clientId,
    ).get("/api/v1/admin/users");

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it("should reject unauthenticated users", async () => {
    const response = await authenticatedRequest(
      "invalid-token",
      "invalid-client-id",
    ).get("/api/v1/admin/users");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("should allow an admin to retrieve a user", async () => {
    const admin = await loginAsAdmin();

    const target = await createVerifiedUserInApplication(admin.applicationId);

    const response = await authenticatedRequest(
      admin.accessToken,
      admin.clientId,
    ).get(`/api/v1/admin/users/${target.user.id}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("should return 404 for a nonexistent user", async () => {
    const admin = await loginAsAdmin();

    const fakeUserId = new Types.ObjectId().toString();

    const response = await authenticatedRequest(
      admin.accessToken,
      admin.clientId,
    ).get(`/api/v1/admin/users/${fakeUserId}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it("should allow an admin to update a user", async () => {
    const admin = await loginAsAdmin();

    const target = await createVerifiedUserInApplication(admin.applicationId);

    const response = await authenticatedRequest(
      admin.accessToken,
      admin.clientId,
    )
      .patch(`/api/v1/admin/users/${target.user.id}`)
      .send({
        firstName: "Updated",
        lastName: "User",
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("should allow an admin to delete a user", async () => {
    const admin = await loginAsAdmin();

    const target = await createVerifiedUserInApplication(admin.applicationId);

    const response = await authenticatedRequest(
      admin.accessToken,
      admin.clientId,
    ).delete(`/api/v1/admin/users/${target.user.id}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const deletedUser = await User.findOne({
      _id: target.user.id,
      applicationId: admin.applicationId,
    });

    expect(deletedUser).toBeNull();
  });

  it("should reject an invalid user ID", async () => {
    const admin = await loginAsAdmin();

    const response = await authenticatedRequest(
      admin.accessToken,
      admin.clientId,
    ).get("/api/v1/admin/users/not-a-valid-id");

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
  });

  it("should not allow an admin to access a user from another application", async () => {
    const admin = await loginAsAdmin();
    const otherApplicationUser = await loginAsVerifiedUser();

    expect(otherApplicationUser.applicationId.equals(admin.applicationId)).toBe(
      false,
    );

    const response = await authenticatedRequest(
      admin.accessToken,
      admin.clientId,
    ).get(`/api/v1/admin/users/${otherApplicationUser.user.id}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
