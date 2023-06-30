import "regenerator-runtime/runtime";
import React from "react";

import "./assets/global.css";

import { EducationalText, SignInPrompt, SignOutButton } from "./ui-components";

export default function App({ isSignedIn, contractId, wallet }) {
  const [valueFromBlockchain, setValueFromBlockchain] = React.useState();
  const [nameFromBlockchain, setNameFromBlockchain] = React.useState();
  const [walletUsername, setwalletUsername] = React.useState();
  const [accountName, setAccountName] = React.useState();
  const [profileUrl, setprofileUrl] = React.useState();
  const [createAccount, setcreateAccount] = React.useState(false);
  const [uiPleaseWait, setUiPleaseWait] = React.useState(false);

  const [output , setOutput] = React.useState("")

  //Get blockchian state once on component load
  React.useEffect(() => {
    getAccount()
      .then(setOutput)
      .catch(alert)
      .finally(() => {
        setUiPleaseWait(false);
      });
    }
  , []);

  React.useEffect(() => {
    getName()
      .then(setNameFromBlockchain)
      .catch(alert)
      .finally(() => {
        setUiPleaseWait(false);
      });
    }
  , []);

  /// If user not signed-in with wallet - show prompt
  if (!isSignedIn) {
    // Sign-in flow will reload the page later
    return (
      <SignInPrompt
        greeting={valueFromBlockchain}
        onClick={() => wallet.signIn()}
      />
    );
  }

  function changeGreeting(e) {
    e.preventDefault();
    setUiPleaseWait(true);
    const { greetingInput } = e.target.elements;

    // use the wallet to send the greeting to the contract
    wallet
      .callMethod({
        method: "set_greeting",
        args: { message: greetingInput.value },
        contractId,
      })
      .then(async () => {
        return getGreeting();
      })
      .then(setValueFromBlockchain)
      .finally(() => {
        setUiPleaseWait(false);
      });
  }

  function changeName(e) {
    e.preventDefault();
    setUiPleaseWait(true);
    const { nameInput } = e.target.elements;

    // use the wallet to send the greeting to the contract
    wallet
      .callMethod({
        method: "set_name",
        args: { name: nameInput.value },
        contractId,
      })
      .then(async () => {
        return getName();
      })
      .then(setNameFromBlockchain)
      .finally(() => {
        setUiPleaseWait(false);
      });
  }

  function getGreeting() {
    // use the wallet to query the contract's greeting
    return wallet.viewMethod({ method: "get_greeting", contractId });
  }

  function getName() {
    return wallet.viewMethod({ method: "get_name", contractId });
  }

  function setupAccount(e) {
    e.preventDefault();
    setUiPleaseWait(true);
    const { walletUsername } = e.target.elements;
    const { accountName } = e.target.elements;
    const { profileUrl } = e.target.elements;
    // use the wallet to send the greeting to the contract
    wallet
      .callMethod({
        method: "set_account",
        args: {
          accountName: accountName.value,
          walletUsername: walletUsername.value,
          profileUrl: profileUrl.value,
        },
        contractId,
      })
      .then(async () => {
        return getAccount();
      })
      .then(setAccountName, setwalletUsername, setprofileUrl)
      .finally(() => {
        setUiPleaseWait(false);
      });
  }

  function getAccount() {
    return wallet.viewMethod({ method: "get_account", contractId });
  }

  return (
    <>
      <SignOutButton
        accountId={wallet.accountId}
        onClick={() => wallet.signOut()}
      />
      <main className={uiPleaseWait ? "please-wait" : ""}>
        <h1>
          The contract says:{" "}
          <span className="greeting">{valueFromBlockchain}</span>
        </h1>
        <h1>
          The contract says:{" "}
          <span className="greeting">{nameFromBlockchain}</span>
        </h1>
        <form onSubmit={changeName} className="change">
          <label>Change greeting:</label>
          <div>
            <input
              autoComplete="off"
              defaultValue={nameFromBlockchain}
              id="nameInput"
            />
            <button>
              <span>Save</span>
              <div className="loader"></div>
            </button>
          </div>
        </form>
      </main>
      <h1>--------------------------</h1>
      {createAccount ? (
        <>
          <h1>ddd</h1>
          <main className={uiPleaseWait ? "please-wait" : ""}>
            <h1>Crate Your Account Now</h1>

            <h1>
              The contract says: <span className="greeting">{output}</span>
            </h1>
            
            <form onSubmit={setupAccount} className="change">
              <label>Change greeting:</label>
              <div>
                <input
                  autoComplete="off"
                  defaultValue={accountName}
                  id="accountName"
                />
                <input
                  autoComplete="off"
                  defaultValue={walletUsername}
                  id="walletUsername"
                />
                <input
                  autoComplete="off"
                  defaultValue={profileUrl}
                  id="profileUrl"
                />
                <button>
                  <span>Save</span>
                  <div className="loader"></div>
                </button>
              </div>
            </form>
          </main>
        </>
      ) : (
        <>
          <div>
            <button onClick={() => setcreateAccount(true)}>
              Create Account
            </button>
          </div>
        </>
      )}
    </>
  );
}
