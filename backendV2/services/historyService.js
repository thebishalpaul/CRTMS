const History = require("../models/History");

class HistoryService {
  async createHistory({ heading, description, targetModel, target, variant, user }, session) {
    try {
      const history = await History.create(
        [
          {
            heading,
            description,
            targetModel,
            target,
            variant,
            user,
          },
        ],
        { session }
      );
      return history;
    } catch (error) {
      console.error("Error creating history:", error.message);
      throw new Error("Failed to create history entry");
    }
  }
}

module.exports = new HistoryService();
