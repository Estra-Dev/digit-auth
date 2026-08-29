export class OwnershipService {
  async ownsUser(loggedInUserId: string, targetUserId: string) {
    return loggedInUserId === targetUserId;
  }

  async ownsProfile(loggedInUserId: string, targetProfileId: string) {
    return loggedInUserId === targetProfileId;
  }
}

export const ownershipService = new OwnershipService();
