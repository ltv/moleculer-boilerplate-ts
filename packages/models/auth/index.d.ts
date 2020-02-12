import { TimestampModel, BaseModel } from '../base';

export interface AuthUsr extends BaseModel, TimestampModel {
  usrId?: number;
  usrNm?: string;
  usrEml?: string;
  usrPwd?: string;
  pwdSalt?: string;
  pwdHashAlgo?: string;
  regDt?: any;
  emlConfToken?: string;
  pwdRemiToken?: string;
  pwdRemiExp?: any;
  usrStatId?: number;
  emlVerified?: number;
  orgId?: number;
}

export interface AuthToken extends BaseModel, TimestampModel {
  authId?: number;
  usrId?: number;
  authToken?: string;
  authWhen?: any;
  orgId?: number;
}

export interface AuthFbUsr extends BaseModel, TimestampModel {
  usrPrfId?: number;
  fbId?: string;
  authWhen?: any;
  orgId?: number;
}

export interface AuthGgUsr extends BaseModel, TimestampModel {
  usrPrfId?: number;
  ggId?: string;
  authWhen?: any;
  orgId?: number;
}

export interface AuthGhUsr extends BaseModel, TimestampModel {
  usrPrfId?: number;
  ghId?: string;
  authWhen?: any;
  orgId?: number;
}
