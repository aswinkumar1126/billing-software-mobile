/** Add-on and additional-charge domain types — used by the billing addon/charge pickers. */

export interface AddOn {
  addonId: number;
  name: string;
  price: number;
  active: boolean;
}

export interface AdditionalCharge {
  additionalChargeId: number;
  name: string;
  price: number;
  active: boolean;
}
