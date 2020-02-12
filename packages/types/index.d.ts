declare module '@app/types' {
  import moleculer, { GenericObject } from 'moleculer';
  // import { AdmUsr, BaseModel } from '@ltv/lc.models';
  export type ServiceMetadata = {
    orgId: number;
    usrId: number;
    user: any; // TODO: Using type User
    roles: string[];
    token: string;
  };

  export class Context extends moleculer.Context<
    GenericObject,
    ServiceMetadata
  > {}
}
