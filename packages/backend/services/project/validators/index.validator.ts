import { ActionParams } from 'moleculer';

export const GetProjectRule: ActionParams = {
  id: { type: 'number', optional: true },
  code: { type: 'string', optional: true },
  name: { type: 'string', optional: true },
  archived: { type: 'boolean', optional: true }
};

export const CreateRule: ActionParams = {
  name: 'string',
  code: 'string',
  archived: { type: 'boolean', optional: true },
  body: { type: 'string', optional: true }
};

export const UpdateRule: ActionParams = {
  id: 'number',
  name: { type: 'string', optional: true },
  code: { type: 'string', optional: true },
  archived: { type: 'boolean', optional: true },
  body: { type: 'string', optional: true }
};

export const FindByIdRule: ActionParams = {
  id: 'number'
};
