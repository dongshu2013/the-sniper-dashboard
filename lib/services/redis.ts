import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

const SERVICE_PREFIX = 'the_sinper_bot';

export const NEW_ACCOUNT_REQUEST_KEY = `${SERVICE_PREFIX}:new_account_request`;
export const phone_code_key = (phone: string) =>
  `${SERVICE_PREFIX}:phone_code:${phone}`;
export const phone_status_key = (phone: string) =>
  `${SERVICE_PREFIX}:phone_status:${phone}`;

export const phone_password_key = (phone: string) =>
  `${SERVICE_PREFIX}:phone_password:${phone}`;

export const redisService = {
  async pushAccountRequest(data: {
    phone: string;
    apiId?: string;
    apiHash?: string;
  }) {
    return redis.lpush(NEW_ACCOUNT_REQUEST_KEY, JSON.stringify(data));
  },

  async setPhoneCode(phone: string, code: string) {
    return await redis.set(phone_code_key(phone), code, 'EX', 600); // 10 min expiration
  },

  async setPassword(phone: string, password: string) {
    return await redis.set(phone_password_key(phone), password);
  },

  async getPhoneStatus(phone: string) {
    return await redis.get(phone_status_key(phone));
  }
};
