const dotenv = require('dotenv');

const setupDotEnv = () => {
  dotenv.config({ path: './test.env' });
};

setupDotEnv();
