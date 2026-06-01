const redisClient = require("../config/redis");

const clearTaskCache = async (organizationId) => {
  const keys = await redisClient.keys(`tasks:${organizationId}:*`);

  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};

module.exports = {
  clearTaskCache,
};
