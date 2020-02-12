import { TimestampModel, BaseModel } from '../base';

export interface AdmExtraRoles {
  roles?: AdmRole[];
}

export interface AdmOrg {
  orgId?: number;
  orgCd?: string;
  orgNm?: string;
  ceoNm?: string;
  phnNum?: string;
  addr?: string;
  billEml?: string;
}

export interface AdmUsr extends BaseModel, AdmExtraRoles {
  usrId: number;
  usrEml?: string;
  usrNm?: string;
  usrPwd?: string;
  fullNm?: string;
  frstNm?: string;
  lstNm?: string;
  timeZone?: any;
  orgId?: number;
}

export interface AdmRole extends BaseModel {
  roleId?: number;
  roleCd?: string;
  roleNm?: string;
  orgId?: number;
  actFlg?: boolean;
  delFlg?: boolean;
  creUsrId?: number;
}

// Old
export interface UsrRole extends BaseModel {
  usrId?: number;
  roleId?: number;
  admRole?: AdmRole;
}

export interface AdmPerm extends BaseModel {
  permId?: number;
  permCd?: string;
  permNm?: string;
  orgId?: number;
}

export interface AdmRolePerm extends BaseModel {
  roleId?: number;
  permId?: number;
  orgId?: number;
  permCd?: string;
  chkAttrFlg?: boolean;
}

export interface AdmUsrRole extends BaseModel {
  usrId?: number;
  roleId?: number;
  orgId?: number;
}

export interface AdmOrg {
  orgId?: number;
  orgCd?: string;
  orgNm?: string;
  ceoNm?: string;
  phnNum?: string;
  addr?: string;
  billEml?: string;
  imageUrl?: string;
}
