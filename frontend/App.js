import "regenerator-runtime/runtime";
import React, { useState } from "react";

//import "./assets/global.css";
import { Contract } from "./near-interface";
import { EducationalText, SignInPrompt, SignOutButton } from "./ui-components";
import { async } from "regenerator-runtime";

//import Setup from "./Setup";

export default function App({ isSignedIn, contractId, wallet }) {
  const contract = new Contract({ contractId: contractId, walletToUse: wallet })
  const [valueFromBlockchain, setValueFromBlockchain] = React.useState();
  const [nameFromBlockchain, setNameFromBlockchain] = React.useState();
  const [walletUsername, setwalletUsername] = React.useState();
  const [accountName, setAccountName] = React.useState();
  const [profileUrl, setprofileUrl] = React.useState();
  const [createAccount, setcreateAccount] = React.useState(false);
  const [uiPleaseWait, setUiPleaseWait] = React.useState(false);
  const [listProjectUI, setListProjectUI] = useState(false)
  const [showProjects, setShowProjects] = useState(false)
  const [donateNow, setDonateNow] = useState(false)

  //for listing project
  const [projectName, setProjectName] = useState()
  const [projectDescription, setprojectDescription] = useState()
  const [projectLogo, setprojectLogo] = useState()
  const [projectLinks, setprojectLinks] = useState()

  //for getting the donation amount
  const [donationAmount, setDinationAmount] = useState()


  const [output, setOutput] = React.useState([]);
  const [outputProj, setOutputProj] = useState([])

  const [messages, setMesages] = useState([]);

  const [amount, setAmount] = useState("")

  //Get blockchian state once on component load
  React.useEffect(() => {
    getAccount()
      .then(setOutput)
      .catch(alert)
      .finally(() => {
        setUiPleaseWait(false);
      });
  }, []);

  React.useEffect(() => {
    getProjects()
      .then(setOutputProj)
      .catch(alert)
      .finally(() => {
        setUiPleaseWait(false);
      });
  }, []);

  React.useEffect(() => {
    getName()
      .then(setNameFromBlockchain)
      .catch(alert)
      .finally(() => {
        setUiPleaseWait(false);
      });
  }, []);

  // React.useEffect(() => {
  //   getDonationAmount()
  //     .then(setDinationAmount)
  //     .catch(alert)
  //     .finally(() => {
  //       setUiPleaseWait(false);
  //     });
  // }, []);


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

  function listProject(e) {
    e.preventDefault()
    setUiPleaseWait(true)
    const { projectName } = e.target.elements
    const { projectDescription } = e.target.elements
    const { projectLogo } = e.target.elements
    const { projectLinks } = e.target.elements

    wallet
      .callMethod({
        method: "publish_project",
        args: {
          projectName: projectName.value,
          projectDescription: projectDescription.value,
          projectLogo: projectLogo.value,
          projectLinks: projectLinks.value,
        },
        contractId
      })
      .then(async () => {
        return getProjects()
      })
      .then(setProjectName, setprojectDescription, setprojectLogo, setprojectLinks)
      .finally(() => {
        setUiPleaseWait(false)
      })
  }

  function getDonation(amount) {
    wallet
      .callMethod({
        method: "increase_donation",
        args: {
          donationAmount: amount
        },
        contractId
      })
      .then(async () => {
        return getDonationAmount()
      })
      .then(setDinationAmount)
      .finally(() => {
        setUiPleaseWait(false)
      })
  }

  async function donation(e) {
    const { amount } = e.target.elements
    try {
      await contract.donate(amount.value)
      //getDonation(amount.value)
    } catch (e) {
      alert(
        'Something went wrong! ' +
        'Maybe you need to sign out and back in? ' +
        'Check your browser console for more info.'
      )
      throw e
    }
  }

  function getAccount() {
    return wallet.viewMethod({ method: "get_account", contractId });
  }


  function getProjects() {
    return wallet.viewMethod({ method: "get_projects", contractId });
  }

  function getDonationAmount() {
    return wallet.viewMethod({ method: "get_donationamount", contractId })
  }


  return (
    <>
      <div class="p-3 mb-2 bg-white text-dark">
        <SignOutButton
          accountId={wallet.accountId}
          onClick={() => wallet.signOut()}
        />

        <h4 class="p-2">
          Welcome Back  -
          <span className="greeting">{output.accountName}</span>
          {/* <span className="greeting">ff : {donationAmount}</span> */}
          {/* <span className="greeting">{outputProj.projectName}</span> */}
        </h4>
        <div class="btn-group grid gap-3 p-2" role="group" aria-label="Basic example">
          <button onClick={() => setListProjectUI(true)} type="button" class="btn btn-primary">List Your Project Now</button>

          <button onClick={() => setShowProjects(true)} type="button" class="btn btn-primary ">Show Projects</button>
        </div>
        <main className={uiPleaseWait ? "please-wait" : ""}>
          <h1 class="p-3">
            Welcome to NEAR CROWD
            <span className="greeting"></span>
          </h1>
          <h2 class="p-2">
            A Crowd Funding Dapp Powered by Near Blockchains
            <span className="greeting"></span>
          </h2>
          <h4 class="p-3">
            Create your Account to List Your Projects to Recieve Public Funding and Give Donations
            <span className="greeting"></span>
          </h4>
        </main>

        {createAccount ? (
          <>
            <main className={uiPleaseWait ? "please-wait" : ""}>
              <h3>Crate Your Account Now</h3>
              <form onSubmit={setupAccount}>
                <div class="mb-3">
                  <label for="exampleInputEmail1" class="form-label">Account Name</label>
                  <input class="form-control" defaultValue={accountName}
                    id="accountName" />

                </div>
                <div class="mb-3">
                  <label for="exampleInputPassword1" class="form-label">Wallet UserName</label>
                  <input class="form-control" defaultValue={walletUsername}
                    id="walletUsername" />
                </div>

                <div class="mb-3">
                  <label for="exampleInputPassword1" class="form-label">ProfileUrl</label>
                  <input class="form-control" defaultValue={profileUrl}
                    id="profileUrl" />
                </div>

                <button type="submit" class="btn btn-primary">Submit</button>
              </form>
              {/* //crate accounr  form */}
            </main>
            {/* <main className={uiPleaseWait ? "please-wait" : ""}>
              <h1>add project now</h1>

              <h1>
                The contract says donate
              </h1>

              <form onSubmit={donation} className="change">
                <label>Change greeting:</label>
                <div>
                  <input
                    autoComplete="off"
                    defaultValue={amount}
                    id="amount"
                  />
                  <button>
                    <span>Save</span>
                    <div className="loader"></div>
                  </button>
                </div>
              </form>
            </main> */}
          </>
        ) : (
          <>
            <div class="h-100 d-flex align-items-center justify-content-center">
            <button type="button" class="btn btn-danger flex justify-center" onClick={() => setcreateAccount(true)}>
                Create or Edit Your Account
              </button>
            </div>
        
          </>
        )}

        {listProjectUI ? (
          <>
            <h3 class="p-2">List Your Project Now </h3>
            <form onSubmit={listProject}>
              <div class="mb-3">
                <label for="exampleInputEmail1" class="form-label">Name</label>
                <input class="form-control" defaultValue={projectName}
                  id="projectName" />
              </div>
              <div class="mb-3">
                <label for="exampleInputEmail1" class="form-label">Description</label>
                <input class="form-control" defaultValue={projectDescription}
                  id="projectDescription" />
              </div>
              <div class="mb-3">
                <label for="exampleInputEmail1" class="form-label">Logo</label>
                <input class="form-control" defaultValue={projectLogo}
                  id="projectLogo" />
              </div>
              <div class="mb-3">
                <label for="exampleInputEmail1" class="form-label">Links</label>
                <input class="form-control" defaultValue={projectLinks}
                  id="projectLinks" />
              </div>

              <button type="submit" class="btn btn-primary">Submit</button>
            </form></>
        ) : (
          <></>
        )}

        {showProjects ? (
          <>
            <h1>{""}</h1>
            <div class="card">
              <img src={outputProj.projectLogo} class="rounded mx-auto d-block" alt="..." />
              <div class="card-body">
                <h5 class="card-title">{outputProj.projectName}</h5>
                <p class="card-text">{outputProj.projectDescription}</p>
                <div class="btn-group grid gap-3 p-2" role="group" aria-label="Basic example">
                <a href={outputProj.projectLinks} class="btn btn-primary p-2">Checkout More</a>
                <button onClick={() => setDonateNow(true)} type="button" class="btn btn-primary p-2">Donate</button>
                </div>
                {donateNow ? (
                  <>
                    <form onSubmit={donation}>
                      <div class="mb-3">
                        <label for="exampleInputEmail1" class="form-label">Amount</label>
                        <input defaultValue={amount}
                          id="amount" class="form-control" />
                      </div>
                      <button type="submit" class="btn btn-primary">Send</button>
                    </form>
                  </>
                ) : (
                  <></>
                )}
              </div>
            </div>
          </>
        ) : (
          <></>
        )}
      </div>
    </>
  );
}
