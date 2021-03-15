import * as React from "react";
import { useState } from "react";
import "./App.css";
import { GetOSKStateMessage, SetOSKStateMessage } from "./models/Messages";
import { OSKState } from "./models/OSKState";

const App = () => {
    const [isOSKEnabled, setIsOSKEnabled] = useState(false);

    const onInitialStateReceived = React.useCallback((state: OSKState) => {
        console.log("state received from content.js: ",state);
        setIsOSKEnabled(state === "show");
    }, []);

    React.useEffect(() => {
        const message = new GetOSKStateMessage();
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(
                tabs[0].id as number,
                message,
                onInitialStateReceived
            );
        });
    }, []);

    const toggleOSKVisibility = (isVisible: boolean) => {
        setIsOSKEnabled(isVisible);

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(
                tabs[0].id as number,
                new SetOSKStateMessage(isVisible ? "show" : "hide")
            );
        });
    };

    return (
        <div className="App">
            <h1 className="heading">OSK Remover</h1>

            <button className="toggle-btn" onClick={(e) => toggleOSKVisibility(!isOSKEnabled)}>
                {isOSKEnabled ? "Disable OSK" : "Enable OSK"}
            </button>
        </div>
    );
};

export default App;
