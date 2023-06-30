// Find all our documentation at https://docs.near.org
import { NearBindgen, near, call, view } from 'near-sdk-js';

@NearBindgen({})
class HelloNear {
  message: string = "Hello";
  name : string = "name"
  accountName : string = "username"
  walletUsername : string = "test_wallet"
  profileUrl : string = "gg"

  @view({}) // This method is read-only and can be called for free
  get_greeting(): string {
    return this.message;
  }

  @view({})
  get_name() : string {
    return this.name
  }

  @view({})
  get_account() :any {
    return{
    accountName : this.accountName,
    walletUsername :this.walletUsername,
    profileUrl : this.profileUrl
    }
  }

  @call({}) // This method changes the state, for which it cost gas
  set_greeting({ message }: { message: string }): void {
    near.log(`Saving greeting ${message}`);
    this.message = message;
  }

 @call({})
  set_name({name} : {name : string}) : void {
    near.log(`Saving greeting ${name}`);
    this.name = name;
  }

  @call({})
  set_account({accountName,walletUsername,profileUrl} : {accountName : string ,walletUsername:string,profileUrl:string}) : void {
    near.log(`Saving greeting ${accountName}`);
    this.accountName = accountName
    this.walletUsername = walletUsername
    this.profileUrl = profileUrl
  }

}