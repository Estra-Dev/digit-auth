import request from "supertest";
import { Types } from "mongoose";

import app from "./app.js";

import { ApplicationService } from "../../modules/application/service/application.service.js";
import { User } from "../../modules/auth/model/user.model.js";

import { buildRegisterPayload } from "./factories.js";
import { getTestWorkspace } from "./workspace.helper.js";
import { withApplicationCredentials } from "./application-auth.helper.js";

const applicationService = new ApplicationService();

export async function createVerifiedUser(
  overrides: Partial<ReturnType<typeof buildRegisterPayload>> = {},
) {
  const payload = buildRegisterPayload(overrides);

  const workspace = await getTestWorkspace();

  const { application, credentials } =
    await applicationService.createApplication(
      workspace.id,
      "DigitAuth Test Application",
    );

  const applicationId = new Types.ObjectId(application.id);

  const response = await withApplicationCredentials(
    request(app).post("/api/v1/auth/register"),
    credentials.clientId,
    credentials.clientSecret,
  ).send(payload);

  if (response.status !== 201) {
    throw new Error(
      `Failed to register test user. Status: ${response.status}. Response: ${JSON.stringify(
        response.body,
      )}`,
    );
  }

  await User.updateOne(
    {
      applicationId,
      email: payload.email,
    },
    {
      emailVerified: true,
    },
  );

  const user = await User.findOne({
    applicationId,
    email: payload.email,
  }).select("+passwordHashed");

  if (!user) {
    throw new Error("Failed to create test user.");
  }

  return {
    user,
    password: payload.password,
    email: payload.email,
    applicationId,
    clientId: credentials.clientId,
    clientSecret: credentials.clientSecret,
  };
}

export {
  createUser,
  createAdminUser,
  createInactiveUser,
  createUnverifiedUser,
} from "./user.factory.js";
