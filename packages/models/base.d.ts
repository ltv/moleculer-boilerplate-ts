/**
 * Create User Id
 * Update User Id
 */
export interface UserMutationModel {
  creUsrId?: number; // Create User Id
  updUsrId?: number; // Update User Id
}

/**
 * Create Date (timestamp)
 * Update Date (timestamp)
 */
export interface TimestampModel {
  creDt?: any; // Create Date
  updDt?: any; // Update Date
}

/**
 * BaseModel
 *
 * active flag
 * delete flag
 */
export interface BaseModel extends UserMutationModel, TimestampModel {
  actFlg?: boolean; // Active Flag
  delFlg?: boolean; // Delete Flag
}

export interface BaseCounter {
  completed: number;
  progress: number;
  total: number;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string;
  endCursor: string;
}

export interface GraphQLResponseData<T> {
  totalCount?: number;
  nodes: T[];
  pageInfo?: PageInfo;
}

export interface GraphQLResponse<T> {
  data: {
    [key: string]: GraphQLResponseData<T>;
  };
}

export interface KnexQueryRaw<T = any> {
  rowCount: number;
  rows: T[];
}
