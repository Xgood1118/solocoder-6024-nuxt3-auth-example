import { verify, hash } from '@node-rs/argon2';

async function hashPassword(plainPassword) {
  return await hash(plainPassword, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1
  });
}
async function verifyPassword(hash2, plainPassword) {
  return await verify(hash2, plainPassword);
}

export { hashPassword as h, verifyPassword as v };
//# sourceMappingURL=password.mjs.map
