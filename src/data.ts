import { Package, Customer, Transaction, SystemSettings, ApiLog } from './types';

export const INITIAL_PACKAGES: Package[] = [
  {
    id: 'pkg-1',
    name: 'Shorol Speed (8 Mbps)',
    speed: 8,
    resellerPrice: 400,
    ispCost: 280,
    durationDays: 30
  },
  {
    id: 'pkg-2',
    name: 'Shorno Goti (15 Mbps)',
    speed: 15,
    resellerPrice: 600,
    ispCost: 420,
    durationDays: 30
  },
  {
    id: 'pkg-3',
    name: 'Mega Power (25 Mbps)',
    speed: 25,
    resellerPrice: 800,
    ispCost: 550,
    durationDays: 30
  },
  {
    id: 'pkg-4',
    name: 'Corporate Elite (50 Mbps)',
    speed: 50,
    resellerPrice: 1500,
    ispCost: 1100,
    durationDays: 30
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Tanbin Hossen (You)',
    userId: 'tanbin01',
    mobile: '01823456789',
    address: 'Chowrasta, Gazipur, Bangladesh',
    activePackageId: 'pkg-3',
    expiryDate: '2026-05-22', // Expiring in 1 day! Let's allow immediate recharge
    status: 'Active',
    connectionType: 'PPPoE'
  },
  {
    id: 'cust-2',
    name: 'Abir Rahman',
    userId: 'abir_net',
    mobile: '01712345678',
    address: 'Mirpur-10, Dhaka',
    activePackageId: 'pkg-2',
    expiryDate: '2026-06-15',
    status: 'Active',
    connectionType: 'PPPoE'
  },
  {
    id: 'cust-3',
    name: 'Jasim Uddin',
    userId: 'jasim_wireless',
    mobile: '01934567890',
    address: 'Agrabad, Chittagong',
    activePackageId: 'pkg-1',
    expiryDate: '2026-05-10', // Already expired!
    status: 'Suspended',
    connectionType: 'DHCP'
  },
  {
    id: 'cust-4',
    name: 'Mst. Sharmin Akter',
    userId: 'sharmin_home',
    mobile: '01545678901',
    address: 'Zindabazar, Sylhet',
    activePackageId: 'pkg-2',
    expiryDate: '2026-05-18', // Expired
    status: 'Pending',
    connectionType: 'Static IP'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN-BK-91823',
    customerId: 'cust-2',
    customerUserId: 'abir_net',
    packageName: 'Shorno Goti (15 Mbps)',
    amountPaid: 600,
    ispCost: 420,
    profit: 180,
    paymentMethod: 'bKash',
    senderNumber: '01711112222',
    trxId: 'BKE8A3K9LM',
    timestamp: '2026-05-15T10:14:00Z',
    status: 'Completed',
    ispApiActivated: true
  },
  {
    id: 'TXN-NG-72819',
    customerId: 'cust-1',
    customerUserId: 'tanbin01',
    packageName: 'Mega Power (25 Mbps)',
    amountPaid: 800,
    ispCost: 550,
    profit: 250,
    paymentMethod: 'Nagad',
    senderNumber: '01823456789',
    trxId: 'NG9F4K2PL8',
    timestamp: '2026-04-22T08:30:00Z',
    status: 'Completed',
    ispApiActivated: true
  }
];

export const INITIAL_SETTINGS: SystemSettings = {
  resellerCompanyName: 'Tanbin Highspeed Net',
  contactMobile: '01823456789',
  bkashNumber: '01823456789',
  bkashType: 'Personal',
  nagadNumber: '01823456789',
  nagadType: 'Personal',
  rocketNumber: '01823456789',
  rocketType: 'Personal',
  parentIspName: 'AmberIT Limited (Bangladesh)',
  parentIspApiUrl: 'https://api.parent-isp.com.bd/v2/reseller/activate_pppoe',
  parentIspUsername: 'tanbin_reseller_dhaka',
  parentIspBalance: 6450, // Reseller balance in Parent ISP pool
  autoApprovePayments: true // If true, payment is validated and API triggers automatically
};

export const INITIAL_LOGS: ApiLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-05-15T10:14:01Z',
    type: 'Payment_Received',
    message: 'bKash payment of BDT 600 received',
    details: 'TrxID: BKE8A3K9LM, Sender: 01711112222, Action: Auto-triggered rechargeable routine for user "abir_net"'
  },
  {
    id: 'log-2',
    timestamp: '2026-05-15T10:14:02Z',
    type: 'ISP_API_Request',
    message: 'ISP API endpoint triggered',
    details: 'POST https://api.parent-isp.com.bd/v2/reseller/activate_pppoe | Payload: { username: "abir_net", cost_bdt: 420, reseller_ref: "TXN-BK-91823" }'
  },
  {
    id: 'log-3',
    timestamp: '2026-05-15T10:14:03Z',
    type: 'ISP_API_Success',
    message: 'Parent ISP renewed subscription successfully',
    details: 'Response 200 OK | Balance: BDT 6450 (Decreased from 6870) | Message: Account abir_net active until 2026-06-15'
  },
  {
    id: 'log-4',
    timestamp: '2026-05-15T10:14:04Z',
    type: 'Profit_Lock',
    message: 'Profit lock notification triggered',
    details: 'Profit of BDT 180 securely retained in bKash wallet (01823456789). Reseller cost BDT 420 paid through Parent ISP credit.'
  }
];
