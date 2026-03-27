import type { DistrictPayoutClaimResult, DistrictSummary, DistrictWarSummary, ResolveDistrictWarResult } from "../domain/territory.types";
import type { DistrictResponseBody, DistrictPayoutClaimResponseBody, DistrictWarResponseBody, ResolveDistrictWarResponseBody } from "./territory.contracts";
export declare function toDistrictResponseBody(district: DistrictSummary): DistrictResponseBody;
export declare function toDistrictPayoutClaimResponseBody(result: DistrictPayoutClaimResult): DistrictPayoutClaimResponseBody;
export declare function toDistrictWarResponseBody(war: DistrictWarSummary): DistrictWarResponseBody;
export declare function toResolveDistrictWarResponseBody(result: ResolveDistrictWarResult): ResolveDistrictWarResponseBody;
