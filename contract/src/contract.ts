import { NearBindgen, near, call, view, initialize, UnorderedMap } from 'near-sdk-js'

import { assert } from './utils'
import { Donation, STORAGE_COST } from './model'

@NearBindgen({})
class DonationContract {
  beneficiary: string = "v1.faucet.nonofficial.testnet";
  donations = new UnorderedMap<bigint>('map-uid-1');
  message: string = "Hello";
  name: string = "name";
  accountName: string = "username";
  walletUsername: string = "test_wallet";
  profileUrl: string = "gg";
  donationAmount : number = 0;

  // for add projects
  projectName: string = "sampleName";
  projectDescription: string = "sampleDescription";
  projectLogo: string = "sampleLogo";
  projectLinks: string = "sampleLinks";

  @view({}) // This method is read-only and can be called for free
  get_greeting(): string {
    return this.message;
  }

  @view({})
  get_name(): string {
    return this.name;
  }

  @view({})
  get_account(): any {
    return {
      accountName: this.accountName,
      walletUsername: this.walletUsername,
      profileUrl: this.profileUrl,
    };
  }

  @view({})
  get_projects(): any {
    return {
      projectName: this.projectName,
      projectDescription: this.projectDescription,
      projectLogo: this.projectLogo,
      projectLinks: this.projectLinks,
    };
  }

  @call({}) // This method changes the state, for which it cost gas
  set_greeting({ message }: { message: string }): void {
    near.log(`Saving greeting ${message}`);
    this.message = message;
  }

  @call({})
  set_name({ name }: { name: string }): void {
    near.log(`Saving greeting ${name}`);
    this.name = name;
  }

  @call({})
  set_account({
    accountName,
    walletUsername,
    profileUrl,
  }: {
    accountName: string;
    walletUsername: string;
    profileUrl: string;
  }): void {
    near.log(`Saving greeting ${accountName}`);
    this.accountName = accountName;
    this.walletUsername = walletUsername;
    this.profileUrl = profileUrl;
  }

  @call({})
  publish_project({
    projectName,
    projectDescription,
    projectLogo,
    projectLinks,
  }: {
    projectName: string;
    projectDescription: string;
    projectLogo: string;
    projectLinks: string;
  }): void {
    this.projectName = projectName;
    this.projectDescription = projectDescription;
    this.projectLogo = projectLogo;
    this.projectLinks = projectLinks;
  }

  @call({})
  increase_donation({amount} : {amount : number}) : void {
    this.donationAmount = this.donationAmount + amount
  }

  @view({})
  get_donationamount() : number {
    return this.donationAmount
  }

  @initialize({ privateFunction: true })
  init({ beneficiary }: { beneficiary: string }) {
    this.beneficiary = beneficiary
  }

  @call({ payableFunction: true })
  donate() {
    // Get who is calling the method and how much $NEAR they attached
    let donor = near.predecessorAccountId();
    let donationAmount: bigint = near.attachedDeposit() as bigint;

    let donatedSoFar = this.donations.get(donor, {defaultValue: BigInt(0)})
    let toTransfer = donationAmount;

    // This is the user's first donation, lets register it, which increases storage
    if (donatedSoFar == BigInt(0)) {
      assert(donationAmount > STORAGE_COST, `Attach at least ${STORAGE_COST} yoctoNEAR`);

      // Subtract the storage cost to the amount to transfer
      toTransfer -= STORAGE_COST
    }

    // Persist in storage the amount donated so far
    donatedSoFar += donationAmount
    this.donations.set(donor, donatedSoFar)
    near.log(`Thank you ${donor} for donating ${donationAmount}! You donated a total of ${donatedSoFar}`);

    // Send the money to the beneficiary
    const promise = near.promiseBatchCreate(this.beneficiary)
    near.promiseBatchActionTransfer(promise, toTransfer)

    // Return the total amount donated so far
    return donatedSoFar.toString()
  }

  @call({ privateFunction: true })
  change_beneficiary(beneficiary) {
    this.beneficiary = beneficiary;
  }

  @view({})
  get_beneficiary(): string { return this.beneficiary }

  @view({})
  number_of_donors(): number { return this.donations.length }

  @view({})
  get_donations({ from_index = 0, limit = 50 }: { from_index: number, limit: number }): Donation[] {
    let ret: Donation[] = []
    let accounts = this.donations.keys({start: from_index, limit})
    for (let account_id of accounts) {
      const donation: Donation = this.get_donation_for_account({ account_id })
      ret.push(donation)
    }
    return ret
  }

  @view({})
  get_donation_for_account({ account_id }: { account_id: string }): Donation {
    return {
      account_id,
      total_amount: this.donations.get(account_id).toString()
    }
  }

 
}