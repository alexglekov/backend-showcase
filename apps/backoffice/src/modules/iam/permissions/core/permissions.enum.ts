export enum PermissionsEnum {
  // dashboard
  dashboard = 'dashboardRead',

  // orders
  ordersRead = 'ordersRead',
  ordersWithdrawAccept = 'ordersWithdrawAccept',
  ordersWithdrawReject = 'ordersWithdrawReject',
  ordersStateRead = 'ordersStateRead',

  // users
  userBalanceHistory = 'userBalanceHistory',
  userBalanceStatistic = 'userBalanceStatistic',

  // groups
  groupsRead = 'groupsRead',
  groupsCreate = 'groupsCreate',
  groupsUpdate = 'groupsUpdate',
  groupsDelete = 'groupsDelete',
  groupsRemoveMember = 'groupsRemoveMember',
  groupsAddMember = 'groupsAddMember',

  // permissions
  permissionsRead = 'permissionsRead',
  groupPermissionsRead = 'groupPermissionsRead',
  groupAddPermissions = 'groupAddPermissions',
  groupRemovePermissions = 'groupRemovePermissions',
}
