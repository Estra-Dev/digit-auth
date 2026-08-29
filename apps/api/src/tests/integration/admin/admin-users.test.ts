import { Types } from "mongoose";
import request from "supertest";

import app from "../../helpers/app.js";
import { createVerifiedUser } from "../../helpers/auth.helper.js";
import { User } from "../../../modules/auth/model/user.model.js";
import { UserRole } from "../../../authorization/roles.js";
import { describe, expect, it } from "vitest";

describe("Admin User Management", () => {
  it("should allow an admin to access the user list", async () => {
    const admin = await createVerifiedUser();

    await User.findByIdAndUpdate(admin.user.id, {
      role: UserRole.ADMIN,
    });

    const loginResponse = await request(app).post("/api/v1/auth/login").send({
      email: admin.email,
      password: admin.password,
    });

    expect(loginResponse.status).toBe(200);

    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .get("/api/v1/admin/users")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("should reject a normal user from accessing admin users", async () => {
    const user = await createVerifiedUser();

    const loginResponse = await request(app).post("/api/v1/auth/login").send({
      email: user.email,
      password: user.password,
    });

    expect(loginResponse.status).toBe(200);

    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .get("/api/v1/admin/users")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it("should reject unauthenticated users", async () => {
    const response = await request(app).get("/api/v1/admin/users");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("should allow an admin to retrieve a user", async () => {
    const admin = await createVerifiedUser();
    const target = await createVerifiedUser();

    await User.findByIdAndUpdate(admin.user.id, {
      role: UserRole.ADMIN,
    });

    const loginResponse = await request(app).post("/api/v1/auth/login").send({
      email: admin.email,
      password: admin.password,
    });

    expect(loginResponse.status).toBe(200);

    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .get(`/api/v1/admin/users/${target.user.id}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("should return 404 for a nonexistent user", async () => {
    const admin = await createVerifiedUser();

    await User.findByIdAndUpdate(admin.user.id, {
      role: UserRole.ADMIN,
    });

    const loginResponse = await request(app).post("/api/v1/auth/login").send({
      email: admin.email,
      password: admin.password,
    });

    const accessToken = loginResponse.body.data.accessToken;

    const fakeUserId = new Types.ObjectId().toString();

    const response = await request(app)
      .get(`/api/v1/admin/users/${fakeUserId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it("should allow an admin to update a user", async () => {
    const admin = await createVerifiedUser();
    const target = await createVerifiedUser();

    await User.findByIdAndUpdate(admin.user.id, {
      role: UserRole.ADMIN,
    });

    const loginResponse = await request(app).post("/api/v1/auth/login").send({
      email: admin.email,
      password: admin.password,
    });

    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .patch(`/api/v1/admin/users/${target.user.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        firstName: "Updated",
        lastName: "User",
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it("should allow an admin to delete a user", async () => {
    const admin = await createVerifiedUser();
    const target = await createVerifiedUser();

    await User.findByIdAndUpdate(admin.user.id, {
      role: UserRole.ADMIN,
    });

    const loginResponse = await request(app).post("/api/v1/auth/login").send({
      email: admin.email,
      password: admin.password,
    });

    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .delete(`/api/v1/admin/users/${target.user.id}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const deletedUser = await User.findById(target.user.id);

    expect(deletedUser).toBeNull();
  });

  it("should reject an invalid user ID", async () => {
    const admin = await createVerifiedUser();

    await User.findByIdAndUpdate(admin.user.id, {
      role: UserRole.ADMIN,
    });

    const loginResponse = await request(app).post("/api/v1/auth/login").send({
      email: admin.email,
      password: admin.password,
    });

    expect(loginResponse.status).toBe(200);

    const accessToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .get("/api/v1/admin/users/not-a-valid-id")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
  });
});
