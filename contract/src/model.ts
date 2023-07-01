// export const POINT_ONE = '100000000000000000000000';

// export class PostedMessage {
//   premium: boolean;
//   sender: string;
//   text: string;

//   constructor({ premium, sender, text }: PostedMessage) {
//     this.premium = premium;
//     this.sender = sender;
//     this.text = text;
//   }
// }

export const STORAGE_COST: bigint = BigInt("1000000000000000000000")

export class Donation {
  account_id: string;
  total_amount: string;
}