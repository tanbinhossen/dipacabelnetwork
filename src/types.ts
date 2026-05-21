export interface Package {
  id: string;
  name: string;
  speed: number; // in Mbps
  resellerPrice: number; // Customer retail price in BDT
  ispCost: number; // Raw cost paid to Parent ISP in BDT
  durationDays: number;
}

export interface Customer {
  id: string;
  name: string;
  userId: string; // The ISP connection username, e.g., 'tanbin_pppoe'
  mobile: string;
  address: string;
  activePackageId: string;
  expiryDate: string;
  status: 'Active' | 'Suspended' | 'Pending';
  connectionType: 'PPPoE' | 'Static IP' | 'DHCP';
}

export interface Transaction {
  id: string;
  customerId: string;
  customerUserId: string;
  packageName: string;
  amountPaid: number;
  ispCost: number;
  profit: number;
  paymentMethod: 'bKash' | 'Nagad' | 'Rocket';
  senderNumber: string;
  trxId: string;
  timestamp: string;
  status: 'Completed' | 'Pending' | 'Failed';
  ispApiActivated: boolean;
}

export interface SystemSettings {
  resellerCompanyName: string;
  contactMobile: string;
  bkashNumber: string;
  bkashType: 'Personal' | 'Merchant';
  nagadNumber: string;
  nagadType: 'Personal' | 'Merchant';
  rocketNumber: string;
  rocketType: 'Personal' | 'Merchant';
  parentIspName: string;
  parentIspApiUrl: string;
  parentIspUsername: string;
  parentIspBalance: number;
  autoApprovePayments: boolean;
  adminPassword?: string; // Persistent admin login passcode (Optional or string)
}

export interface ApiLog {
  id: string;
  timestamp: string;
  type: 'Payment_Received' | 'ISP_API_Request' | 'ISP_API_Success' | 'ISP_API_Failure' | 'Profit_Lock';
  message: string;
  details: string;
}
