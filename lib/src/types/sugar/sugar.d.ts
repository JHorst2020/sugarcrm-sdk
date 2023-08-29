export interface sugarConstructor {
    username: string;
    password: string;
    client_id: string;
    client_secret: string;
    platform: string;
    host: string;
    version: string;
}
export interface sugarRequest {
    pathname: string;
    method: string;
    body?: object;
    data?: object;
}
export interface SugarFilterType {
    [field: string]: number | string | string[];
}
export type OrFilterObject = {
    [key: string]: string | number;
};
export type FilterObject = OrFilterObject | {
    $or: OrFilterObject[];
};
export interface FilterAndObject {
    $and: FilterObject[];
}
export type FilterReturnType = FilterObject | FilterAndObject;
export type SugarAccountType = {
    [key: string]: string | number;
};
