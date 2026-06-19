import { c as defineEventHandler } from '../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const me_get = defineEventHandler(async (event) => {
  const userWithPassword = event.context.user;
  if (!userWithPassword) {
    return {
      user: null
    };
  }
  const { password: _password, ...userWithoutPassword } = userWithPassword;
  return {
    user: userWithoutPassword
  };
});

export { me_get as default };
//# sourceMappingURL=me.get.mjs.map
