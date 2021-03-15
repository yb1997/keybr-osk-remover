import { GET_OSK_STATE, OSK_STATE, SET_OSK_STATE } from "./constants";
import { GetOSKStateMessage, OSKMessage, SetOSKStateMessage } from "./models/Messages";
import { OSKState } from "./models/OSKState";
type MessageSender = chrome.runtime.MessageSender;
type Response = (response?: any) => void


const css = document.createElement("style");
css.innerHTML = `
    #root {
        height: 100%;
    }
    .Practice {
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    .Practice-textInput {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .Practice-keyboard {
        display: none!important;
    }
`;

// css.sheet?.insertRule(`
//     #root {
//         height: 100%;
//     }
// `);

// css.sheet?.insertRule(`
//     .Practice {
//         height: 100%;
//         display: flex;
//         flex-direction: column;
//     }
// `);

// css.sheet?.insertRule(`
//     .Practice-textInput {
//         flex: 1;
//         display: flex;
//         align-items: center;
//         justify-content: center;
//     }
// `);

// css.sheet?.insertRule(`
//     .Practice-keyboard {
//         display: none!important;
//     }
// `);

css.id = "osk-remover";

function toggleStyles(state: OSKState) {
    if (state === "show" && document.head.contains(css)) {
        document.head.removeChild(css);
    } else if (state === "hide") {
        document.head.appendChild(css);
    } else {
        console.warn("unknown state: ", state);
    }
}

function isOSKVisibleOnUI(): boolean {
    return getComputedStyle(document.querySelector(".Practice-keyboard") as HTMLElement).display !== "none";
}

function getOSKState(message: OSKMessage, sender: MessageSender, response: Response) {
    message = message as GetOSKStateMessage;

    const currentState = localStorage.getItem(OSK_STATE) as OSKState;
    const actualState = isOSKVisibleOnUI() ? "show" : "hide";
    console.log("currentState: ", currentState, "actualState: ", actualState);
    if (currentState === actualState) {
        response(currentState);
    } else {
        // state mismatch possibly due to localStorage cleared or modified, synchronise with UI...
        localStorage.setItem(OSK_STATE, actualState);
        response(actualState);
    }

}

function setOSKState(message: OSKMessage, sender: MessageSender, response: Response) {
    message = message as SetOSKStateMessage;
    toggleStyles(message.payload);
    localStorage.setItem(OSK_STATE, message.payload);
    response();
}

function addListeners() {
    const listeners = {
        [GET_OSK_STATE]: getOSKState, 
        [SET_OSK_STATE]: setOSKState
    }

    chrome.runtime.onMessage.addListener(
        (message: OSKMessage, sender, response) => {
            if (message.from !== "popup") return;

            const listener = listeners[message.type];

            try {
                listener(message, sender, response);
            } catch(ex) {
                console.error(ex);
                // maybe send an exception message so that popup or background script can react to it
            }
        }
    );
}

function main() {
    addListeners();
    const oskState = localStorage.getItem(OSK_STATE) as OSKState | null;

    if (oskState === null) {
        toggleStyles("hide");
        localStorage.setItem(OSK_STATE, "hide" as OSKState);
    } else {
        toggleStyles(oskState);
    }
}

main();
