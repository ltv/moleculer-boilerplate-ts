import { Service } from 'moleculer-decorators';

import { BaseService } from 'utils/BaseService';
import { SERVICE_USER } from 'utils/constants';

@Service({
  name: SERVICE_USER,
  mixins: [],
  settings: {}
})
class UserService extends BaseService {}

export = UserService;
