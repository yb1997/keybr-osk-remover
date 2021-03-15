import { OSKState } from "./OSKState";
import { GET_OSK_STATE, SET_OSK_STATE } from "../constants";

export class Message<T extends string, P> {
    constructor(
        public readonly type: T, 
        public readonly payload: P,
        public readonly from: "popup" | "content" | "background" = "popup",
    ) {}
};

export class GetOSKStateMessage extends Message<typeof GET_OSK_STATE, null> {
    constructor() {
        super(GET_OSK_STATE, null);
    }
} 
export class SetOSKStateMessage extends Message<typeof SET_OSK_STATE, OSKState> {
    constructor(oskState: OSKState) {
        super(SET_OSK_STATE, oskState);
    }
}
export type OSKMessage = GetOSKStateMessage | SetOSKStateMessage;