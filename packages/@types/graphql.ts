export type Datetime = Date;

export interface IntFilter {
  // Is null (if `true` is specified) or is not null (if `false` is specified).
  isNull?: boolean;

  // Equal to the specified value.
  equalTo?: number;

  // Not equal to the specified value.
  notEqualTo?: number;

  // Not equal to the specified value, treating null like an ordinary value.
  distinctFrom?: number;

  // Equal to the specified value, treating null like an ordinary value.
  notDistinctFrom?: number;

  // Included in the specified list.
  in?: number[];

  // Not included in the specified list.
  notIn?: number[];

  // Less than the specified value.
  lessThan?: number;

  // Less than or equal to the specified value.
  lessThanOrEqualTo?: number;

  // Greater than the specified value.
  greaterThan?: number;

  // Greater than or equal to the specified value.
  greaterThanOrEqualTo?: number;
}

// A filter to be used against String fields. All fields are combined with a logical ‘and.’
export interface StringFilter {
  // Is null (if `true` is specified) or is not null (if `false` is specified).
  isNull: boolean;

  // Equal to the specified value.
  equalTo?: string;

  // Not equal to the specified value.
  notEqualTo?: string;

  // Not equal to the specified value, treating null like an ordinary value.
  distinctFrom?: string;

  // Equal to the specified value, treating null like an ordinary value.
  notDistinctFrom?: string;

  // Included in the specified list.
  in?: string[];

  // Not included in the specified list.
  notIn?: string[];

  // Less than the specified value.
  lessThan?: string;

  // Less than or equal to the specified value.
  lessThanOrEqualTo?: string;

  // Greater than the specified value.
  greaterThan?: string;

  // Greater than or equal to the specified value.
  greaterThanOrEqualTo?: string;

  // Contains the specified string (case-sensitive).
  includes?: string;

  // Does not contain the specified string (case-sensitive).
  notIncludes?: string;

  // Contains the specified string (case-insensitive).
  includesInsensitive?: string;

  // Does not contain the specified string (case-insensitive).
  notIncludesInsensitive?: string;

  // Starts with the specified string (case-sensitive).
  startsWith?: string;

  // Does not start with the specified string (case-sensitive).
  notStartsWith?: string;

  // Starts with the specified string (case-insensitive).
  startsWithInsensitive?: string;

  // Does not start with the specified string (case-insensitive).
  notStartsWithInsensitive?: string;

  // Ends with the specified string (case-sensitive).
  endsWith?: string;

  // Does not end with the specified string (case-sensitive).
  notEndsWith?: string;

  // Ends with the specified string (case-insensitive).
  endsWithInsensitive?: string;

  // Does not end with the specified string (case-insensitive).
  notEndsWithInsensitive?: string;

  // Matches the specified pattern (case-sensitive). An underscore (_) matches any
  // single character; a percent sign (%) matches any sequence of zero or more characters.
  like?: string;

  // Does not match the specified pattern (case-sensitive). An underscore (_)
  // matches any single character; a percent sign (%) matches any sequence of zero
  // or more characters.
  notLike?: string;

  // Matches the specified pattern (case-insensitive). An underscore (_) matches
  // any single character; a percent sign (%) matches any sequence of zero or more characters.
  likeInsensitive?: string;

  // Does not match the specified pattern (case-insensitive). An underscore (_)
  // matches any single character; a percent sign (%) matches any sequence of zero
  // or more characters.
  notLikeInsensitive?: string;

  // Equal to the specified value (case-insensitive).
  equalToInsensitive?: string;

  // Not equal to the specified value (case-insensitive).
  notEqualToInsensitive?: string;

  // Not equal to the specified value, treating null like an ordinary value (case-insensitive).
  distinctFromInsensitive?: string;

  // Equal to the specified value, treating null like an ordinary value (case-insensitive).
  notDistinctFromInsensitive?: string;

  // Included in the specified list (case-insensitive).
  inInsensitive?: string[];

  // Not included in the specified list (case-insensitive).
  notInInsensitive?: string[];

  // Less than the specified value (case-insensitive).
  lessThanInsensitive?: string;

  // Less than or equal to the specified value (case-insensitive).
  lessThanOrEqualToInsensitive?: string;

  // Greater than the specified value (case-insensitive).
  greaterThanInsensitive?: string;

  // Greater than or equal to the specified value (case-insensitive).
  greaterThanOrEqualToInsensitive?: string;
}

export interface BooleanFilter {
  // Is null (if `true` is specified) or is not null (if `false` is specified).
  isNull?: boolean;

  // Equal to the specified value.
  equalTo?: boolean;

  // Not equal to the specified value.
  notEqualTo?: boolean;

  // Not equal to the specified value, treating null like an ordinary value.
  distinctFrom?: boolean;

  // Equal to the specified value, treating null like an ordinary value.
  notDistinctFrom?: boolean;

  // Included in the specified list.
  in?: boolean[];

  // Not included in the specified list.
  notIn?: boolean[];

  // Less than the specified value.
  lessThan?: boolean;

  // Less than or equal to the specified value.
  lessThanOrEqualTo?: boolean;

  // Greater than the specified value.
  greaterThan?: boolean;

  // Greater than or equal to the specified value.
  greaterThanOrEqualTo?: boolean;
}

// A filter to be used against Datetime fields. All fields are combined with a logical ‘and.’
export interface DatetimeFilter {
  // Is null (if `true` is specified) or is not null (if `false` is specified).
  isNull?: boolean;

  // Equal to the specified value.
  equalTo?: Datetime;

  // Not equal to the specified value.
  notEqualTo?: Datetime;

  // Not equal to the specified value, treating null like an ordinary value.
  distinctFrom?: Datetime;

  // Equal to the specified value, treating null like an ordinary value.
  notDistinctFrom?: Datetime;

  // Included in the specified list.
  in?: Datetime[];

  // Not included in the specified list.
  notIn?: Datetime[];

  // Less than the specified value.
  lessThan?: Datetime;

  // Less than or equal to the specified value.
  lessThanOrEqualTo?: Datetime;

  // Greater than the specified value.
  greaterThan?: Datetime;

  // Greater than or equal to the specified value.
  greaterThanOrEqualTo?: Datetime;
}
